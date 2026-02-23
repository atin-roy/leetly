package com.atinroy.leetly.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserStatsRepository extends JpaRepository<UserStats, Long> {

    Optional<UserStats> findByUser(User user);
}
