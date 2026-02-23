package com.atinroy.leetly.problem;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatternRepository extends JpaRepository<Pattern, Long> {

    /**
     * Eagerly fetches the associated topic so that listing all patterns does not
     * trigger a separate SELECT per pattern (N+1).
     */
    @EntityGraph(attributePaths = {"topic"})
    List<Pattern> findAll();

    List<Pattern> findByTopic(Topic topic);
}
