package com.atinroy.leetly.user;

import com.atinroy.leetly.problem.Language;
import jakarta.validation.constraints.NotNull;

public record UpdateLanguageRequest(@NotNull Language language) {}
