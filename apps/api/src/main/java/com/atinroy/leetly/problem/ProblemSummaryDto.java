package com.atinroy.leetly.problem;

import java.time.LocalDateTime;

public record ProblemSummaryDto(
        Long id,
        long leetcodeId,
        String title,
        String url,
        Difficulty difficulty,
        ProblemStatus status,
        LocalDateTime lastAttemptedAt
) {
    public static ProblemSummaryDto from(Problem problem) {
        return new ProblemSummaryDto(
                problem.getId(),
                problem.getLeetcodeId(),
                problem.getTitle(),
                problem.getUrl(),
                problem.getDifficulty(),
                problem.getStatus(),
                problem.getLastAttemptedAt()
        );
    }
}
