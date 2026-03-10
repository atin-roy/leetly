package com.atinroy.leetly.problem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.atinroy.leetly.problem.model.Difficulty;

public record CreateProblemRequest(
        @Positive long leetcodeId,
        @NotBlank String title,
        @NotBlank String url,
        @NotNull Difficulty difficulty
) {}
