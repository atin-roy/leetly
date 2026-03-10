package com.atinroy.leetly.problem.dto;

import java.time.LocalDateTime;
import com.atinroy.leetly.problem.model.Difficulty;
import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.problem.model.ProblemStatus;

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
