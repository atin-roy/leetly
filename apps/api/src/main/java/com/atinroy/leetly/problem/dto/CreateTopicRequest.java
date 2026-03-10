package com.atinroy.leetly.problem.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateTopicRequest(@NotBlank String name, String description) {}
