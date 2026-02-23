package com.atinroy.leetly.user;

import jakarta.validation.constraints.NotBlank;

public record CreateProblemListRequest(@NotBlank String name) {}
