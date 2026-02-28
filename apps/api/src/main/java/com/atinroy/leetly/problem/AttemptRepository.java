package com.atinroy.leetly.problem;

import com.atinroy.leetly.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttemptRepository extends JpaRepository<Attempt, Long> {

    List<Attempt> findByUserOrderByCreatedDateAsc(User user);

    List<Attempt> findByProblemAndUser(Problem problem, User user);

    Optional<Attempt> findByIdAndProblemIdAndUser(Long id, Long problemId, User user);

    List<Attempt> findByProblemAndUserAndOutcome(Problem problem, User user, Outcome outcome);

    long countByProblemAndUser(Problem problem, User user);
}
