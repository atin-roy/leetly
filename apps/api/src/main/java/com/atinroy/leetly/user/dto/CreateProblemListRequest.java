package com.atinroy.leetly.user.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateProblemListRequest(@NotBlank String name) {}
