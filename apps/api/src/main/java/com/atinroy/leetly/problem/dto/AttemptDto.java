package com.atinroy.leetly.problem.dto;

import java.time.LocalDateTime;
import java.util.List;
import com.atinroy.leetly.problem.model.Attempt;
import com.atinroy.leetly.problem.model.Language;
import com.atinroy.leetly.problem.model.Mistake;
import com.atinroy.leetly.problem.model.Outcome;

public record AttemptDto(
        Long id,
        Long problemId,
        int attemptNumber,
        Language language,
        String code,
        Outcome outcome,
        Integer durationMinutes,
        List<Mistake> mistakes,
        String timeComplexity,
        String spaceComplexity,
        String aiReview,
        String learned,
        String takeaways,
        String notes,
        LocalDateTime createdDate
) {
    public static AttemptDto from(Attempt attempt) {
        return new AttemptDto(
                attempt.getId(),
                attempt.getProblem().getId(),
                attempt.getAttemptNumber(),
                attempt.getLanguage(),
                attempt.getCode(),
                attempt.getOutcome(),
                attempt.getDurationMinutes(),
                attempt.getMistakes(),
                attempt.getTimeComplexity(),
                attempt.getSpaceComplexity(),
                attempt.getAiReview(),
                attempt.getLearned(),
                attempt.getTakeaways(),
                attempt.getNotes(),
                attempt.getCreatedDate()
        );
    }
}
