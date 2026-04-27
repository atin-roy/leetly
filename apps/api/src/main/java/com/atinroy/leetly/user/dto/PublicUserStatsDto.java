package com.atinroy.leetly.user.dto;

public record PublicUserStatsDto(
        int totalSolved,
        int totalSolvedWithHelp,
        int totalMastered,
        int totalAttempts,
        int currentStreak,
        int longestStreak,
        int solvedThisWeek,
        int solvedThisMonth,
        int distinctTopicsCovered,
        int distinctPatternsCovered
) {}
