package com.atinroy.leetly.problem;

import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(@NotNull ProblemStatus status) {}
