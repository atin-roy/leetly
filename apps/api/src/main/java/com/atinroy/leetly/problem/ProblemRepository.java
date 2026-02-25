package com.atinroy.leetly.problem;

import com.atinroy.leetly.user.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long>, JpaSpecificationExecutor<Problem> {

    Optional<Problem> findByIdAndUser(Long id, User user);

    /**
     * Acquires a pessimistic write lock on the problem row before the caller
     * counts and inserts an attempt. This serialises concurrent attempt creation
     * for the same (problem, user) pair and prevents duplicate attempt numbers.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Problem p WHERE p.id = :id AND p.user = :user")
    Optional<Problem> findByIdForUpdateAndUser(@Param("id") Long id, @Param("user") User user);
}
