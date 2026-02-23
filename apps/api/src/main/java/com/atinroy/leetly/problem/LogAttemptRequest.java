package com.atinroy.leetly.problem;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record LogAttemptRequest(
        @NotNull Language language,
        String code,
        @NotNull Outcome outcome,
        @Min(0) Integer durationMinutes,
        List<Mistake> mistakes,
        String timeComplexity,
        String spaceComplexity,
        String aiReview,
        String learned,
        String takeaways,
        String notes
) {}
