package com.atinroy.leetly.review.dto;

import com.atinroy.leetly.problem.model.Difficulty;
import com.atinroy.leetly.problem.model.ProblemStatus;
import com.atinroy.leetly.review.model.CardState;

import java.time.LocalDateTime;

public record ReviewCardDto(
    Long id,
    Long problemId,
    long leetcodeId,
    String problemTitle,
    String problemUrl,
    Difficulty difficulty,
    ProblemStatus problemStatus,
    CardState state,
    double stability,
    double fsrsDifficulty,
    LocalDateTime due,
    LocalDateTime lastReview,
    int reps,
    int lapses,
    int scheduledDays,
    int elapsedDays
) {}
