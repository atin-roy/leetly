package com.atinroy.leetly.problem.dto;

import jakarta.validation.constraints.NotNull;
import com.atinroy.leetly.problem.model.ProblemStatus;

public record UpdateStatusRequest(@NotNull ProblemStatus status) {}
