package com.atinroy.leetly.problem;

import jakarta.validation.constraints.NotBlank;

public record CreatePatternRequest(@NotBlank String name, String description, Long topicId, boolean namedAlgorithm) {}
