package com.atinroy.leetly.problem.dto;

import com.atinroy.leetly.problem.model.Difficulty;
import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.problem.model.ProblemStatus;
import com.atinroy.leetly.review.model.CardState;
import com.atinroy.leetly.review.model.ReviewCard;

import java.time.LocalDateTime;
import java.util.Map;

public record ProblemSummaryDto(
        Long id,
        long leetcodeId,
        String title,
        String url,
        Difficulty difficulty,
        ProblemStatus status,
        LocalDateTime lastAttemptedAt,
        int totalAttempts,
        ReviewCardInfo reviewCard
) {
    public record ReviewCardInfo(Long id, CardState state, LocalDateTime due, int reps, int lapses, double stability) {}

    /** Used for single-problem responses (create/update/status patch). */
    public static ProblemSummaryDto from(Problem problem) {
        return new ProblemSummaryDto(
                problem.getId(),
                problem.getLeetcodeId(),
                problem.getTitle(),
                problem.getUrl(),
                problem.getDifficulty(),
                problem.getStatus(),
                problem.getLastAttemptedAt(),
                0,
                null
        );
    }

    /** Used for list responses — enriched inside the transaction. */
    public static ProblemSummaryDto of(
            Problem problem,
            Map<Long, Long> attemptCounts,
            Map<Long, ReviewCard> reviewCardMap
    ) {
        long count = attemptCounts.getOrDefault(problem.getId(), 0L);
        ReviewCard rc = reviewCardMap.get(problem.getId());
        ReviewCardInfo rcInfo = rc == null ? null : new ReviewCardInfo(rc.getId(), rc.getState(), rc.getDue(), rc.getReps(), rc.getLapses(), rc.getStability());
        return new ProblemSummaryDto(
                problem.getId(),
                problem.getLeetcodeId(),
                problem.getTitle(),
                problem.getUrl(),
                problem.getDifficulty(),
                problem.getStatus(),
                problem.getLastAttemptedAt(),
                (int) count,
                rcInfo
        );
    }
}
