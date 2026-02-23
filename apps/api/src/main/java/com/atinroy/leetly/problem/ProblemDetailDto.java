package com.atinroy.leetly.problem;

import java.util.List;

public record ProblemDetailDto(
        Long id,
        long leetcodeId,
        String title,
        String url,
        Difficulty difficulty,
        ProblemStatus status,
        List<TopicDto> topics,
        List<PatternDto> patterns,
        List<ProblemSummaryDto> relatedProblems,
        List<AttemptDto> attempts
) {
    public static ProblemDetailDto from(Problem problem) {
        return new ProblemDetailDto(
                problem.getId(),
                problem.getLeetcodeId(),
                problem.getTitle(),
                problem.getUrl(),
                problem.getDifficulty(),
                problem.getStatus(),
                problem.getTopics().stream().map(TopicDto::from).toList(),
                problem.getPatterns().stream().map(PatternDto::from).toList(),
                problem.getRelatedProblems().stream().map(ProblemSummaryDto::from).toList(),
                problem.getAttempts().stream().map(AttemptDto::from).toList()
        );
    }
}
