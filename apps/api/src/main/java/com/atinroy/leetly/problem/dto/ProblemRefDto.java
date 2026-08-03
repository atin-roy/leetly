package com.atinroy.leetly.problem.dto;

/**
 * Minimal per-problem projection used by the client both to detect problems
 * the user has already added and to search across their full problem set
 * (e.g. the command palette) without fetching whole rows or paginating.
 */
public record ProblemRefDto(long leetcodeId, long id, String title) {
}
