package com.atinroy.leetly.user.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateThemeRequest(@NotBlank String name, String properties) {}
