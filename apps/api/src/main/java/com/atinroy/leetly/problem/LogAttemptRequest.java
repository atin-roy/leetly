package com.atinroy.leetly.problem;

import java.util.List;

public record LogAttemptRequest(
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
        String notes
) {}
