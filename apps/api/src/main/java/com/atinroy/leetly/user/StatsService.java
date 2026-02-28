package com.atinroy.leetly.user;

import com.atinroy.leetly.common.ResourceNotFoundException;
import com.atinroy.leetly.problem.Attempt;
import com.atinroy.leetly.problem.AttemptRepository;
import com.atinroy.leetly.problem.Difficulty;
import com.atinroy.leetly.problem.LogAttemptRequest;
import com.atinroy.leetly.problem.Mistake;
import com.atinroy.leetly.problem.Outcome;
import com.atinroy.leetly.problem.Problem;
import com.atinroy.leetly.problem.ProblemRepository;
import com.atinroy.leetly.problem.ProblemStatus;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Transactional
@RequiredArgsConstructor
public class StatsService {

    private final UserStatsRepository userStatsRepository;
    private final ProblemRepository problemRepository;
    private final AttemptRepository attemptRepository;
    private final DailyStatRepository dailyStatRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public UserStats getByUser(User user) {
        UserStats stats = userStatsRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("UserStats not found for user: " + user.getId()));

        recalculateStats(user, stats);
        return stats;
    }

    @Transactional(readOnly = true)
    public List<DailyStat> getDailyStatsBetween(User user, LocalDate from, LocalDate to) {
        List<Problem> problems = problemRepository.findAllByUser(user);
        List<Attempt> attempts = attemptRepository.findByUserOrderByCreatedDateAsc(user);
        Map<Long, List<Attempt>> attemptsByProblemId = groupAttemptsByProblem(attempts);
        Map<LocalDate, DailyStat> dailyStats = new LinkedHashMap<>();

        for (Attempt attempt : attempts) {
            LocalDate attemptDate = toLocalDate(attempt.getCreatedDate());
            if (attemptDate == null || attemptDate.isBefore(from) || attemptDate.isAfter(to)) {
                continue;
            }

            DailyStat daily = dailyStats.computeIfAbsent(attemptDate, this::newDailyStat);
            daily.setAttempted(daily.getAttempted() + 1);
            if (attempt.getDurationMinutes() != null) {
                daily.setTimeMinutes(daily.getTimeMinutes() + attempt.getDurationMinutes());
            }
        }

        for (Problem problem : problems) {
            LocalDate solveDate = findSolveDate(problem, attemptsByProblemId.get(problem.getId()));
            if (solveDate == null || solveDate.isBefore(from) || solveDate.isAfter(to)) {
                continue;
            }

            DailyStat daily = dailyStats.computeIfAbsent(solveDate, this::newDailyStat);
            daily.setSolved(daily.getSolved() + 1);
        }

        return dailyStats.values().stream()
                .sorted(Comparator.comparing(DailyStat::getDate))
                .toList();
    }

    public void updateOnAttempt(User user, Attempt attempt, boolean isFirstSolve) {
        UserStats stats = userStatsRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("UserStats not found for user: " + user.getId()));

        stats.setTotalAttempts(stats.getTotalAttempts() + 1);
        if (attempt.getDurationMinutes() != null) {
            stats.setTotalTimeMinutes(stats.getTotalTimeMinutes() + attempt.getDurationMinutes());
        }

        if (isFirstSolve) {
            stats.setTotalSolved(stats.getTotalSolved() + 1);
            if (attempt.getAttemptNumber() == 1) {
                stats.setFirstAttemptSolves(stats.getFirstAttemptSolves() + 1);
            }
            incrementDifficultyCount(stats, attempt.getProblem().getDifficulty());
            updateStreak(stats);
        }

        updateMistakeBreakdown(stats, attempt.getMistakes(), 1);
        userStatsRepository.save(stats);

        upsertDailyStat(user, attempt.getDurationMinutes(), isFirstSolve,
                attempt.getCreatedDate() != null ? attempt.getCreatedDate().toLocalDate() : LocalDate.now(),
                1);
    }

    public void adjustOnAttemptDelete(User user, Attempt attempt, AttemptRepository attemptRepository) {
        UserStats stats = userStatsRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("UserStats not found for user: " + user.getId()));

        stats.setTotalAttempts(Math.max(0, stats.getTotalAttempts() - 1));
        if (attempt.getDurationMinutes() != null) {
            stats.setTotalTimeMinutes(Math.max(0, stats.getTotalTimeMinutes() - attempt.getDurationMinutes()));
        }

        boolean wasOnlyAccepted = attempt.getOutcome() == Outcome.ACCEPTED &&
                attemptRepository.findByProblemAndUserAndOutcome(attempt.getProblem(), user, Outcome.ACCEPTED)
                        .stream().filter(a -> !a.getId().equals(attempt.getId())).findAny().isEmpty();

        if (wasOnlyAccepted) {
            stats.setTotalSolved(Math.max(0, stats.getTotalSolved() - 1));
            if (attempt.getAttemptNumber() == 1) {
                stats.setFirstAttemptSolves(Math.max(0, stats.getFirstAttemptSolves() - 1));
            }
            decrementDifficultyCount(stats, attempt.getProblem().getDifficulty());
        }

        updateMistakeBreakdown(stats, attempt.getMistakes(), -1);
        userStatsRepository.save(stats);

        adjustDailyStat(user, attempt.getDurationMinutes(), wasOnlyAccepted,
                attempt.getCreatedDate() != null ? attempt.getCreatedDate().toLocalDate() : LocalDate.now(),
                -1);
    }

    public void adjustOnAttemptUpdate(User user, Attempt oldAttempt, LogAttemptRequest newRequest) {
        UserStats stats = userStatsRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("UserStats not found for user: " + user.getId()));

        int oldDuration = oldAttempt.getDurationMinutes() != null ? oldAttempt.getDurationMinutes() : 0;
        int newDuration = newRequest.durationMinutes() != null ? newRequest.durationMinutes() : 0;
        stats.setTotalTimeMinutes(Math.max(0, stats.getTotalTimeMinutes() + newDuration - oldDuration));

        updateMistakeBreakdown(stats, oldAttempt.getMistakes(), -1);
        List<Mistake> newMistakes = newRequest.mistakes() != null ? newRequest.mistakes() : List.of();
        updateMistakeBreakdown(stats, newMistakes, 1);

        boolean oldAccepted = oldAttempt.getOutcome() == Outcome.ACCEPTED;
        boolean newAccepted = newRequest.outcome() == Outcome.ACCEPTED;

        if (oldAccepted && !newAccepted) {
            stats.setTotalSolved(Math.max(0, stats.getTotalSolved() - 1));
            if (oldAttempt.getAttemptNumber() == 1) {
                stats.setFirstAttemptSolves(Math.max(0, stats.getFirstAttemptSolves() - 1));
            }
            decrementDifficultyCount(stats, oldAttempt.getProblem().getDifficulty());
        } else if (!oldAccepted && newAccepted) {
            stats.setTotalSolved(stats.getTotalSolved() + 1);
            if (oldAttempt.getAttemptNumber() == 1) {
                stats.setFirstAttemptSolves(stats.getFirstAttemptSolves() + 1);
            }
            incrementDifficultyCount(stats, oldAttempt.getProblem().getDifficulty());
        }

        userStatsRepository.save(stats);

        LocalDate attemptDate = oldAttempt.getCreatedDate() != null
                ? oldAttempt.getCreatedDate().toLocalDate() : LocalDate.now();
        adjustDailyStatTime(user, attemptDate, newDuration - oldDuration);
        if (oldAccepted && !newAccepted) {
            adjustDailyStat(user, 0, true, attemptDate, -1);
        } else if (!oldAccepted && newAccepted) {
            upsertDailyStat(user, 0, true, attemptDate, 0);
        }
    }

    private void recalculateStats(User user, UserStats stats) {
        List<Problem> problems = problemRepository.findAllByUser(user);
        List<Attempt> attempts = attemptRepository.findByUserOrderByCreatedDateAsc(user);
        Map<Long, List<Attempt>> attemptsByProblemId = groupAttemptsByProblem(attempts);

        stats.setTotalSolved(0);
        stats.setTotalSolvedWithHelp(0);
        stats.setTotalMastered(0);
        stats.setTotalAttempted(0);
        stats.setEasySolved(0);
        stats.setMediumSolved(0);
        stats.setHardSolved(0);
        stats.setTotalAttempts(attempts.size());
        stats.setFirstAttemptSolves(0);
        stats.setTotalTimeMinutes(0);
        stats.setCurrentStreak(0);
        stats.setLongestStreak(0);
        stats.setLastSolvedDate(null);
        stats.setSolvedThisWeek(0);
        stats.setSolvedThisMonth(0);
        stats.setDistinctTopicsCovered(0);
        stats.setDistinctPatternsCovered(0);

        Map<String, Integer> mistakeBreakdown = new HashMap<>();
        Set<Long> distinctTopicIds = new HashSet<>();
        Set<Long> distinctPatternIds = new HashSet<>();
        List<LocalDate> solveDates = new ArrayList<>();

        for (Attempt attempt : attempts) {
            if (attempt.getDurationMinutes() != null) {
                stats.setTotalTimeMinutes(stats.getTotalTimeMinutes() + attempt.getDurationMinutes());
            }
            for (Mistake mistake : attempt.getMistakes()) {
                mistakeBreakdown.merge(mistake.name(), 1, Integer::sum);
            }
        }

        for (Problem problem : problems) {
            problem.getTopics().stream()
                    .map(topic -> topic.getId())
                    .forEach(distinctTopicIds::add);
            problem.getPatterns().stream()
                    .map(pattern -> pattern.getId())
                    .forEach(distinctPatternIds::add);

            if (problem.getStatus() != ProblemStatus.UNSEEN) {
                stats.setTotalAttempted(stats.getTotalAttempted() + 1);
            }

            switch (problem.getStatus()) {
                case SOLVED -> stats.setTotalSolved(stats.getTotalSolved() + 1);
                case SOLVED_WITH_HELP -> stats.setTotalSolvedWithHelp(stats.getTotalSolvedWithHelp() + 1);
                case MASTERED -> stats.setTotalMastered(stats.getTotalMastered() + 1);
                default -> {
                }
            }

            if (isSolvedStatus(problem.getStatus())) {
                incrementDifficultyCount(stats, problem.getDifficulty());
                LocalDate solveDate = findSolveDate(problem, attemptsByProblemId.get(problem.getId()));
                if (solveDate != null) {
                    solveDates.add(solveDate);
                }
            }

            Attempt firstAcceptedAttempt = findFirstAcceptedAttempt(attemptsByProblemId.get(problem.getId()));
            if (firstAcceptedAttempt != null && firstAcceptedAttempt.getAttemptNumber() == 1) {
                stats.setFirstAttemptSolves(stats.getFirstAttemptSolves() + 1);
            }
        }

        stats.setDistinctTopicsCovered(distinctTopicIds.size());
        stats.setDistinctPatternsCovered(distinctPatternIds.size());
        stats.setMistakeBreakdown(writeMistakeBreakdown(mistakeBreakdown));
        applySolveWindowStats(stats, solveDates);
    }

    private Map<Long, List<Attempt>> groupAttemptsByProblem(List<Attempt> attempts) {
        Map<Long, List<Attempt>> attemptsByProblemId = new HashMap<>();
        for (Attempt attempt : attempts) {
            if (attempt.getProblem() == null || attempt.getProblem().getId() == null) {
                continue;
            }
            attemptsByProblemId
                    .computeIfAbsent(attempt.getProblem().getId(), ignored -> new ArrayList<>())
                    .add(attempt);
        }
        return attemptsByProblemId;
    }

    private void applySolveWindowStats(UserStats stats, List<LocalDate> solveDates) {
        if (solveDates.isEmpty()) {
            return;
        }

        LocalDate startOfWeek = LocalDate.now().with(DayOfWeek.MONDAY);
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        Set<LocalDate> uniqueDates = new HashSet<>(solveDates);

        stats.setSolvedThisWeek((int) solveDates.stream().filter(date -> !date.isBefore(startOfWeek)).count());
        stats.setSolvedThisMonth((int) solveDates.stream().filter(date -> !date.isBefore(startOfMonth)).count());
        stats.setLastSolvedDate(solveDates.stream().max(LocalDate::compareTo).orElse(null));
        stats.setLongestStreak(calculateLongestStreak(uniqueDates));
        stats.setCurrentStreak(calculateCurrentStreak(uniqueDates));
    }

    private int calculateLongestStreak(Set<LocalDate> solveDates) {
        int longest = 0;

        for (LocalDate date : solveDates) {
            if (solveDates.contains(date.minusDays(1))) {
                continue;
            }

            int streak = 1;
            LocalDate cursor = date;
            while (solveDates.contains(cursor.plusDays(1))) {
                cursor = cursor.plusDays(1);
                streak++;
            }
            longest = Math.max(longest, streak);
        }

        return longest;
    }

    private int calculateCurrentStreak(Set<LocalDate> solveDates) {
        if (solveDates.isEmpty()) {
            return 0;
        }

        LocalDate cursor = LocalDate.now();
        if (!solveDates.contains(cursor)) {
            cursor = cursor.minusDays(1);
            if (!solveDates.contains(cursor)) {
                return 0;
            }
        }

        int streak = 0;
        while (solveDates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private LocalDate findSolveDate(Problem problem, List<Attempt> attempts) {
        if (!isSolvedStatus(problem.getStatus())) {
            return null;
        }

        Attempt firstAcceptedAttempt = findFirstAcceptedAttempt(attempts);
        if (firstAcceptedAttempt != null) {
            LocalDate acceptedDate = toLocalDate(firstAcceptedAttempt.getCreatedDate());
            if (acceptedDate != null) {
                return acceptedDate;
            }
        }

        LocalDate modifiedDate = toLocalDate(problem.getLastModifiedDate());
        if (modifiedDate != null) {
            return modifiedDate;
        }

        return toLocalDate(problem.getCreatedDate());
    }

    private Attempt findFirstAcceptedAttempt(List<Attempt> attempts) {
        if (attempts == null) {
            return null;
        }

        return attempts.stream()
                .filter(attempt -> attempt.getOutcome() == Outcome.ACCEPTED)
                .min(Comparator
                        .comparing((Attempt attempt) -> attempt.getCreatedDate() == null)
                        .thenComparing(Attempt::getCreatedDate, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparingInt(Attempt::getAttemptNumber))
                .orElse(null);
    }

    private boolean isSolvedStatus(ProblemStatus status) {
        return status == ProblemStatus.SOLVED
                || status == ProblemStatus.SOLVED_WITH_HELP
                || status == ProblemStatus.MASTERED;
    }

    private void incrementDifficultyCount(UserStats stats, Difficulty difficulty) {
        switch (difficulty) {
            case EASY -> stats.setEasySolved(stats.getEasySolved() + 1);
            case MEDIUM -> stats.setMediumSolved(stats.getMediumSolved() + 1);
            case HARD -> stats.setHardSolved(stats.getHardSolved() + 1);
        }
    }

    private void decrementDifficultyCount(UserStats stats, Difficulty difficulty) {
        switch (difficulty) {
            case EASY -> stats.setEasySolved(Math.max(0, stats.getEasySolved() - 1));
            case MEDIUM -> stats.setMediumSolved(Math.max(0, stats.getMediumSolved() - 1));
            case HARD -> stats.setHardSolved(Math.max(0, stats.getHardSolved() - 1));
        }
    }

    private void updateStreak(UserStats stats) {
        LocalDate today = LocalDate.now();
        LocalDate lastSolved = stats.getLastSolvedDate();

        if (lastSolved == null || lastSolved.isBefore(today.minusDays(1))) {
            stats.setCurrentStreak(1);
        } else if (lastSolved.equals(today.minusDays(1))) {
            stats.setCurrentStreak(stats.getCurrentStreak() + 1);
        }

        if (stats.getCurrentStreak() > stats.getLongestStreak()) {
            stats.setLongestStreak(stats.getCurrentStreak());
        }
        stats.setLastSolvedDate(today);
    }

    private void updateMistakeBreakdown(UserStats stats, List<Mistake> mistakes, int delta) {
        if (mistakes == null || mistakes.isEmpty()) {
            return;
        }
        try {
            Map<String, Integer> breakdown = new HashMap<>();
            if (stats.getMistakeBreakdown() != null) {
                breakdown = objectMapper.readValue(stats.getMistakeBreakdown(),
                        new TypeReference<Map<String, Integer>>() {});
            }
            for (Mistake mistake : mistakes) {
                int newVal = breakdown.getOrDefault(mistake.name(), 0) + delta;
                if (newVal <= 0) {
                    breakdown.remove(mistake.name());
                } else {
                    breakdown.put(mistake.name(), newVal);
                }
            }
            stats.setMistakeBreakdown(objectMapper.writeValueAsString(breakdown));
        } catch (Exception e) {
            throw new RuntimeException("Failed to update mistake breakdown", e);
        }
    }

    private void upsertDailyStat(User user, Integer durationMinutes, boolean isSolve,
                                 LocalDate date, int attemptDelta) {
        DailyStat daily = dailyStatRepository.findByUserAndDate(user, date)
                .orElseGet(() -> {
                    DailyStat d = new DailyStat();
                    d.setUser(user);
                    d.setDate(date);
                    return d;
                });

        daily.setAttempted(Math.max(0, daily.getAttempted() + attemptDelta));
        if (isSolve) {
            daily.setSolved(daily.getSolved() + 1);
        }
        if (durationMinutes != null) {
            daily.setTimeMinutes(Math.max(0, daily.getTimeMinutes() + durationMinutes));
        }
        dailyStatRepository.save(daily);
    }

    private void adjustDailyStat(User user, Integer durationMinutes, boolean wasSolve,
                                 LocalDate date, int attemptDelta) {
        dailyStatRepository.findByUserAndDate(user, date).ifPresent(daily -> {
            daily.setAttempted(Math.max(0, daily.getAttempted() + attemptDelta));
            if (wasSolve) {
                daily.setSolved(Math.max(0, daily.getSolved() - 1));
            }
            if (durationMinutes != null) {
                daily.setTimeMinutes(Math.max(0, daily.getTimeMinutes() - durationMinutes));
            }
            dailyStatRepository.save(daily);
        });
    }

    private void adjustDailyStatTime(User user, LocalDate date, int timeDelta) {
        if (timeDelta == 0) {
            return;
        }
        dailyStatRepository.findByUserAndDate(user, date).ifPresent(daily -> {
            daily.setTimeMinutes(Math.max(0, daily.getTimeMinutes() + timeDelta));
            dailyStatRepository.save(daily);
        });
    }

    private DailyStat newDailyStat(LocalDate date) {
        DailyStat stat = new DailyStat();
        stat.setDate(date);
        return stat;
    }

    private LocalDate toLocalDate(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.toLocalDate() : null;
    }

    private String writeMistakeBreakdown(Map<String, Integer> breakdown) {
        try {
            return objectMapper.writeValueAsString(breakdown);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize mistake breakdown", e);
        }
    }
}
