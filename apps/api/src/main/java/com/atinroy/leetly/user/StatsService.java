package com.atinroy.leetly.user;

import com.atinroy.leetly.common.ResourceNotFoundException;
import com.atinroy.leetly.problem.Attempt;
import com.atinroy.leetly.problem.AttemptRepository;
import com.atinroy.leetly.problem.Difficulty;
import com.atinroy.leetly.problem.LogAttemptRequest;
import com.atinroy.leetly.problem.Mistake;
import com.atinroy.leetly.problem.Outcome;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class StatsService {

    private final UserStatsRepository userStatsRepository;
    private final DailyStatRepository dailyStatRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public UserStats getByUser(User user) {
        UserStats stats = userStatsRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("UserStats not found for user: " + user.getId()));

        // Compute rolling windows on-demand from DailyStat (never stale)
        LocalDate startOfWeek = LocalDate.now().with(DayOfWeek.MONDAY);
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        stats.setSolvedThisWeek(dailyStatRepository.sumSolvedSince(user, startOfWeek));
        stats.setSolvedThisMonth(dailyStatRepository.sumSolvedSince(user, startOfMonth));

        return stats;
    }

    @Transactional(readOnly = true)
    public List<DailyStat> getDailyStatsBetween(User user, LocalDate from, LocalDate to) {
        return dailyStatRepository.findByUserAndDateBetween(user, from, to);
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

        // Adjust time
        int oldDuration = oldAttempt.getDurationMinutes() != null ? oldAttempt.getDurationMinutes() : 0;
        int newDuration = newRequest.durationMinutes() != null ? newRequest.durationMinutes() : 0;
        stats.setTotalTimeMinutes(Math.max(0, stats.getTotalTimeMinutes() + newDuration - oldDuration));

        // Adjust mistakes: reverse old, apply new
        updateMistakeBreakdown(stats, oldAttempt.getMistakes(), -1);
        List<Mistake> newMistakes = newRequest.mistakes() != null ? newRequest.mistakes() : List.of();
        updateMistakeBreakdown(stats, newMistakes, 1);

        // Adjust solve stats if outcome changed
        boolean oldAccepted = oldAttempt.getOutcome() == Outcome.ACCEPTED;
        boolean newAccepted = newRequest.outcome() == Outcome.ACCEPTED;

        if (oldAccepted && !newAccepted) {
            // Removing a solve: only affects totalSolved if this was the only accepted attempt
            // We'll check after the fact — for now adjust stats, Problem.status will be handled separately
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

        // Adjust DailyStat time delta and solved delta
        LocalDate attemptDate = oldAttempt.getCreatedDate() != null
                ? oldAttempt.getCreatedDate().toLocalDate() : LocalDate.now();
        adjustDailyStatTime(user, attemptDate, newDuration - oldDuration);
        if (oldAccepted && !newAccepted) {
            adjustDailyStat(user, 0, true, attemptDate, -1);
        } else if (!oldAccepted && newAccepted) {
            upsertDailyStat(user, 0, true, attemptDate, 0);
        }
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
        // lastSolved == today → no change (already counted)

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
        if (timeDelta == 0) return;
        dailyStatRepository.findByUserAndDate(user, date).ifPresent(daily -> {
            daily.setTimeMinutes(Math.max(0, daily.getTimeMinutes() + timeDelta));
            dailyStatRepository.save(daily);
        });
    }
}
