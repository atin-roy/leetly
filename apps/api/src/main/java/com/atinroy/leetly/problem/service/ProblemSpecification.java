package com.atinroy.leetly.problem.service;

import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import com.atinroy.leetly.problem.model.Difficulty;
import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.problem.model.ProblemStatus;

public final class ProblemSpecification {

    private ProblemSpecification() {
    }

    public static Specification<Problem> buildSpec(String difficulty, String status, Long topicId, Long patternId, String search) {
        Specification<Problem> spec = (root, query, cb) -> cb.conjunction();

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
            String normalizedSearch = search.trim();
            String loweredSearch = normalizedSearch.toLowerCase();

            spec = spec.and((root, query, cb) -> {
                var titleMatch = cb.like(cb.lower(root.get("title")), "%" + loweredSearch + "%");
                var leetcodeIdMatch = cb.like(root.get("leetcodeId").as(String.class), "%" + normalizedSearch + "%");

                return cb.or(
                        titleMatch,
                        leetcodeIdMatch
                );
            });
        }

        return spec;
    }
}
