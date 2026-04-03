package com.atinroy.leetly.problem.dto;

import java.time.LocalDateTime;
import java.util.List;
import com.atinroy.leetly.problem.model.Difficulty;
import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.problem.model.ProblemStatus;

public record ProblemDetailDto(
        Long id,
        long leetcodeId,
        String title,
        String url,
        Difficulty difficulty,
        ProblemStatus status,
        LocalDateTime lastAttemptedAt,
        String aiReview,
        List<TopicDto> topics,
        List<PatternDto> patterns,
        List<ProblemSummaryDto> relatedProblems,
        List<AttemptDto> attempts,
        ReviewCardSummary reviewCard
) {
    public record ReviewCardSummary(
            Long id,
            String state,
            LocalDateTime due,
            int reps,
            int lapses,
            double stability
    ) {}

    public ProblemDetailDto withReviewCard(ReviewCardSummary reviewCard) {
        return new ProblemDetailDto(
                id, leetcodeId, title, url, difficulty, status, lastAttemptedAt, aiReview,
                topics, patterns, relatedProblems, attempts, reviewCard
        );
    }

    public static ProblemDetailDto from(Problem problem) {
        return new ProblemDetailDto(
                problem.getId(),
                problem.getLeetcodeId(),
                problem.getTitle(),
                problem.getUrl(),
                problem.getDifficulty(),
                problem.getStatus(),
                problem.getLastAttemptedAt(),
                problem.getAiReview(),
                problem.getTopics().stream().map(TopicDto::from).toList(),
                problem.getPatterns().stream().map(PatternDto::from).toList(),
                problem.getRelatedProblems().stream().map(ProblemSummaryDto::from).toList(),
                problem.getAttempts().stream().map(AttemptDto::from).toList(),
                null
        );
    }
}
