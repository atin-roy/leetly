package com.atinroy.leetly.user;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProblemListRepository extends JpaRepository<ProblemList, Long> {

    /**
     * Eagerly fetches problems so listing a user's lists does not produce N+1
     * queries when rendering the problem count or problem summaries.
     */
    @EntityGraph(attributePaths = {"problems"})
    List<ProblemList> findByUser(User user);

    Optional<ProblemList> findByIdAndUser(Long id, User user);

    Optional<ProblemList> findByUserAndIsDefaultTrue(User user);
}
