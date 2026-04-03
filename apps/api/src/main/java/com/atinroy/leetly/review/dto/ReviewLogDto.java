package com.atinroy.leetly.review.dto;

import com.atinroy.leetly.review.model.CardState;
import com.atinroy.leetly.review.model.Rating;
import com.atinroy.leetly.review.model.ReviewType;

import java.time.LocalDateTime;

public record ReviewLogDto(
    Long id,
    Rating rating,
    CardState state,
    double stability,
    double difficulty,
    int elapsedDays,
    int scheduledDays,
    ReviewType reviewType,
    Long attemptId,
    LocalDateTime reviewedAt
) {}
