package com.atinroy.leetly.review.dto;

import jakarta.validation.constraints.NotNull;

public record EnrollReviewRequest(
    @NotNull Long problemId
) {}
