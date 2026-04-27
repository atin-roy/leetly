package com.atinroy.leetly.user.dto;

public record PublicProblemListDto(
        Long id,
        String name,
        boolean isDefault,
        int totalProblems,
        int completedProblems,
        int remainingProblems,
        int masteredProblems
) {}
