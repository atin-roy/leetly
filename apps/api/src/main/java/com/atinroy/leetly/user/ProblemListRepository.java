package com.atinroy.leetly.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProblemListRepository extends JpaRepository<ProblemList, Long> {

    List<ProblemList> findByUser(User user);

    Optional<ProblemList> findByUserAndIsDefaultTrue(User user);
}
