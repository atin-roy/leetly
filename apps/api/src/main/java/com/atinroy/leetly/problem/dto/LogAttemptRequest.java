package com.atinroy.leetly.problem.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;
import com.atinroy.leetly.problem.model.Language;
import com.atinroy.leetly.problem.model.Mistake;
import com.atinroy.leetly.problem.model.Outcome;

public record LogAttemptRequest(
        @NotNull Language language,
        String code,
        String approach,
        @NotNull Outcome outcome,
        @Min(0) Integer durationMinutes,
        List<Mistake> mistakes,
        String timeComplexity,
        String spaceComplexity,
        String aiReview,
        String learned,
        String takeaways,
        String notes,
        LocalDateTime startedAt,
        LocalDateTime endedAt
) {}
