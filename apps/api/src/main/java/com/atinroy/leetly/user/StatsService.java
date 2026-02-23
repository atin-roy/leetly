package com.atinroy.leetly.user;

import com.atinroy.leetly.problem.Attempt;
import com.atinroy.leetly.problem.Difficulty;
import com.atinroy.leetly.problem.Mistake;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        return userStatsRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("UserStats not found for user: " + user.getId()));
    }

    @Transactional(readOnly = true)
    public List<DailyStat> getDailyStatsBetween(User user, LocalDate from, LocalDate to) {
        return dailyStatRepository.findByUserAndDateBetween(user, from, to);
    }

    public void updateOnAttempt(User user, Attempt attempt, boolean isFirstSolve) {
        UserStats stats = userStatsRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("UserStats not found for user: " + user.getId()));

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
            stats.setSolvedThisWeek(stats.getSolvedThisWeek() + 1);
            stats.setSolvedThisMonth(stats.getSolvedThisMonth() + 1);
            updateStreak(stats);
        }

        updateMistakeBreakdown(stats, attempt);
        userStatsRepository.save(stats);

        upsertDailyStat(user, attempt, isFirstSolve);
    }

    private void incrementDifficultyCount(UserStats stats, Difficulty difficulty) {
        switch (difficulty) {
            case EASY -> stats.setEasySolved(stats.getEasySolved() + 1);
            case MEDIUM -> stats.setMediumSolved(stats.getMediumSolved() + 1);
            case HARD -> stats.setHardSolved(stats.getHardSolved() + 1);
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

    private void updateMistakeBreakdown(UserStats stats, Attempt attempt) {
        if (attempt.getMistakes() == null || attempt.getMistakes().isEmpty()) {
            return;
        }
        try {
            Map<String, Integer> breakdown = new HashMap<>();
            if (stats.getMistakeBreakdown() != null) {
                breakdown = objectMapper.readValue(stats.getMistakeBreakdown(),
                        new TypeReference<Map<String, Integer>>() {});
            }
            for (Mistake mistake : attempt.getMistakes()) {
                breakdown.merge(mistake.name(), 1, Integer::sum);
            }
            stats.setMistakeBreakdown(objectMapper.writeValueAsString(breakdown));
        } catch (Exception e) {
            throw new RuntimeException("Failed to update mistake breakdown", e);
        }
    }

    private void upsertDailyStat(User user, Attempt attempt, boolean isFirstSolve) {
        LocalDate today = LocalDate.now();
        DailyStat daily = dailyStatRepository.findByUserAndDate(user, today)
                .orElseGet(() -> {
                    DailyStat d = new DailyStat();
                    d.setUser(user);
                    d.setDate(today);
                    return d;
                });

        daily.setAttempted(daily.getAttempted() + 1);
        if (isFirstSolve) {
            daily.setSolved(daily.getSolved() + 1);
        }
        if (attempt.getDurationMinutes() != null) {
            daily.setTimeMinutes(daily.getTimeMinutes() + attempt.getDurationMinutes());
        }
        dailyStatRepository.save(daily);
    }
}
