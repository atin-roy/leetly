package com.atinroy.leetly.user.dto;

import com.atinroy.leetly.problem.model.Language;
import jakarta.validation.constraints.NotNull;

public record UpdateLanguageRequest(@NotNull Language language) {}
