package com.atinroy.leetly.problem;

import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public final class ProblemSpecification {

    private ProblemSpecification() {
    }

    public static Specification<Problem> buildSpec(String difficulty, String status, Long topicId, Long patternId, String search) {
        Specification<Problem> spec = Specification.where((Specification<Problem>) null);

        if (difficulty != null && !difficulty.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("difficulty"), Difficulty.valueOf(difficulty)));
        }

        if (status != null && !status.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("status"), ProblemStatus.valueOf(status)));
        }

        if (topicId != null) {
            spec = spec.and((root, query, cb) -> {
                query.distinct(true);
                return cb.equal(root.join("topics", JoinType.INNER).get("id"), topicId);
            });
        }

        if (patternId != null) {
            spec = spec.and((root, query, cb) -> {
                query.distinct(true);
                return cb.equal(root.join("patterns", JoinType.INNER).get("id"), patternId);
            });
        }

        if (search != null && !search.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"));
        }

        return spec;
    }
}
