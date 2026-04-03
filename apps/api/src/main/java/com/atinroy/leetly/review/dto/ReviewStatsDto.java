package com.atinroy.leetly.review.dto;

public record ReviewStatsDto(
    long dueNow,
    long upcoming7Days,
    long totalEnrolled
) {}
