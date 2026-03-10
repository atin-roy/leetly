package com.atinroy.leetly.problem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.atinroy.leetly.problem.model.Topic;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
}
