package com.atinroy.leetly.user;

import com.atinroy.leetly.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "user_stats")
public class UserStats extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Problem counts by status
    @Column(nullable = false)
    private int totalSolved = 0;

    @Column(nullable = false)
    private int totalSolvedWithHelp = 0;

    @Column(nullable = false)
    private int totalMastered = 0;

    @Column(nullable = false)
    private int totalAttempted = 0;

    // Problem counts by difficulty
    @Column(nullable = false)
    private int easySolved = 0;

    @Column(nullable = false)
    private int mediumSolved = 0;

    @Column(nullable = false)
    private int hardSolved = 0;

    // Attempt stats
    @Column(nullable = false)
    private int totalAttempts = 0;

    @Column(nullable = false)
    private int firstAttemptSolves = 0;

    @Column(nullable = false)
    private int totalTimeMinutes = 0;

    // Streaks
    @Column(nullable = false)
    private int currentStreak = 0;

    @Column(nullable = false)
    private int longestStreak = 0;

    private LocalDate lastSolvedDate;

    // Progress windows
    @Column(nullable = false)
    private int solvedThisWeek = 0;

    @Column(nullable = false)
    private int solvedThisMonth = 0;

    // Coverage
    @Column(nullable = false)
    private int distinctTopicsCovered = 0;

    @Column(nullable = false)
    private int distinctPatternsCovered = 0;

    // Mistake breakdown — e.g. {"WRONG_PATTERN": 5, "OFF_BY_ONE": 3}
    @Column(columnDefinition = "jsonb")
    private String mistakeBreakdown;
}
