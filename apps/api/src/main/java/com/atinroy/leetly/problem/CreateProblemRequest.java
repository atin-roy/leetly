package com.atinroy.leetly.problem;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateProblemRequest(
        @Positive long leetcodeId,
        @NotBlank String title,
        @NotBlank String url,
        @NotNull Difficulty difficulty
) {}
