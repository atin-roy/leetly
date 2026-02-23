package com.atinroy.leetly.user;

import java.time.LocalDate;

public record UserStatsDto(
        Long id,
        int totalSolved,
        int totalSolvedWithHelp,
        int totalMastered,
        int totalAttempted,
        int easySolved,
        int mediumSolved,
        int hardSolved,
        int totalAttempts,
        int firstAttemptSolves,
        int totalTimeMinutes,
        int currentStreak,
        int longestStreak,
        LocalDate lastSolvedDate,
        int solvedThisWeek,
        int solvedThisMonth,
        int distinctTopicsCovered,
        int distinctPatternsCovered,
        String mistakeBreakdown
) {
    public static UserStatsDto from(UserStats stats) {
        return new UserStatsDto(
                stats.getId(),
                stats.getTotalSolved(),
                stats.getTotalSolvedWithHelp(),
                stats.getTotalMastered(),
                stats.getTotalAttempted(),
                stats.getEasySolved(),
                stats.getMediumSolved(),
                stats.getHardSolved(),
                stats.getTotalAttempts(),
                stats.getFirstAttemptSolves(),
                stats.getTotalTimeMinutes(),
                stats.getCurrentStreak(),
                stats.getLongestStreak(),
                stats.getLastSolvedDate(),
                stats.getSolvedThisWeek(),
                stats.getSolvedThisMonth(),
                stats.getDistinctTopicsCovered(),
                stats.getDistinctPatternsCovered(),
                stats.getMistakeBreakdown()
        );
    }
}
