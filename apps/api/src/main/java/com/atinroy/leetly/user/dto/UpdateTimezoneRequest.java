package com.atinroy.leetly.user.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateTimezoneRequest(@NotBlank String timezone) {}
