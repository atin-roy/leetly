package com.atinroy.leetly.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProblemListRepository extends JpaRepository<ProblemList, Long> {
}
