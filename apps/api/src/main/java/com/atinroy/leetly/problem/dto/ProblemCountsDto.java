package com.atinroy.leetly.problem.dto;

import java.util.Map;

/**
 * Aggregate counts over the user's library. The dashboard needs totals by
 * difficulty and by status; it was deriving them client-side from a
 * 1000-row page of full problem rows.
 *
 * <p>{@code solvedByDifficulty} is status-derived like {@code byDifficulty}, so
 * the two divide into a meaningful ratio. {@code UserStats.easySolved} and its
 * siblings count first solves from attempts instead, and pairing those with a
 * status-derived total gives a progress bar that can exceed 100%.
 */
public record ProblemCountsDto(
        long total,
        Map<String, Long> byDifficulty,
        Map<String, Long> solvedByDifficulty,
        Map<String, Long> byStatus) {
}
