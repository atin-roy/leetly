package com.atinroy.leetly.problem.dto;

/**
 * Minimal identity pair used by the client to detect problems the user has
 * already added, without fetching whole problem rows.
 */
public record ProblemRefDto(long leetcodeId, long id) {
}
