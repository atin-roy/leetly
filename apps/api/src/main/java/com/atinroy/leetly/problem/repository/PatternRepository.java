package com.atinroy.leetly.problem.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import com.atinroy.leetly.problem.model.Pattern;
import com.atinroy.leetly.problem.model.Topic;

@Repository
public interface PatternRepository extends JpaRepository<Pattern, Long> {

    /**
     * Eagerly fetches the associated topic so that listing all patterns does not
     * trigger a separate SELECT per pattern (N+1).
     */
    @EntityGraph(attributePaths = {"topic"})
    List<Pattern> findAllByOrderByNameAsc();

    @EntityGraph(attributePaths = {"topic"})
    List<Pattern> findByTopicOrderByNameAsc(Topic topic);
}
