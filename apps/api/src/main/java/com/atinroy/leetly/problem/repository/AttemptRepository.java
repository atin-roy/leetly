package com.atinroy.leetly.problem.repository;

import com.atinroy.leetly.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import com.atinroy.leetly.problem.model.Attempt;
import com.atinroy.leetly.problem.model.Outcome;
import com.atinroy.leetly.problem.model.Problem;

@Repository
public interface AttemptRepository extends JpaRepository<Attempt, Long> {

    List<Attempt> findByUserOrderByCreatedDateAsc(User user);

    List<Attempt> findByProblemAndUser(Problem problem, User user);

    Optional<Attempt> findByIdAndProblemIdAndUser(Long id, Long problemId, User user);

    List<Attempt> findByProblemAndUserAndOutcome(Problem problem, User user, Outcome outcome);

    long countByProblemAndUser(Problem problem, User user);

    @Query("SELECT MAX(a.createdDate) FROM Attempt a WHERE a.problem = :problem AND a.user = :user")
    Optional<LocalDateTime> findMaxCreatedDateByProblemAndUser(@Param("problem") Problem problem, @Param("user") User user);

    @Query("SELECT a.problem.id, COUNT(a) FROM Attempt a WHERE a.problem.id IN :ids AND a.user = :user GROUP BY a.problem.id")
    List<Object[]> countByProblemIdsAndUser(@Param("ids") List<Long> ids, @Param("user") User user);
}
