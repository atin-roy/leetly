package com.atinroy.leetly.problem;

public record CreateProblemRequest(
        long leetcodeId,
        String title,
        String url,
        Difficulty difficulty
) {}
