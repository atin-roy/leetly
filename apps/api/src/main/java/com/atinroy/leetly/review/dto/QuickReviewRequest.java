package com.atinroy.leetly.review.dto;

import com.atinroy.leetly.review.model.Rating;
import jakarta.validation.constraints.NotNull;

public record QuickReviewRequest(
    @NotNull Rating rating
) {}
