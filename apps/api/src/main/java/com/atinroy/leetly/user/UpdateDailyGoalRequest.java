package com.atinroy.leetly.user;

import jakarta.validation.constraints.Min;

public record UpdateDailyGoalRequest(@Min(1) int dailyGoal) {}
