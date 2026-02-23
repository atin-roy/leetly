package com.atinroy.leetly.problem;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {

    /**
     * Acquires a pessimistic write lock on the problem row before the caller
     * counts and inserts an attempt. This serialises concurrent attempt creation
     * for the same (problem, user) pair and prevents duplicate attempt numbers.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Problem p WHERE p.id = :id")
    Optional<Problem> findByIdForUpdate(@Param("id") Long id);

    /**
     * Eagerly fetches all collections needed by ProblemDetailDto to avoid
     * separate lazy-load queries per collection.
     */
    @EntityGraph(attributePaths = {"topics", "patterns", "patterns.topic", "relatedProblems"})
    @Query("SELECT p FROM Problem p WHERE p.id = :id")
    Optional<Problem> findDetailById(@Param("id") Long id);
}
