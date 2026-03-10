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
                problem.getLastAttemptedAt(),
                problem.getTopics().stream().map(TopicDto::from).toList(),
                problem.getPatterns().stream().map(PatternDto::from).toList(),
                problem.getRelatedProblems().stream().map(ProblemSummaryDto::from).toList(),
                problem.getAttempts().stream().map(AttemptDto::from).toList()
        );
    }
}
