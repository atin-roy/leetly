package com.atinroy.leetly.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.model.UserStats;

@Repository
public interface UserStatsRepository extends JpaRepository<UserStats, Long> {

    Optional<UserStats> findByUser(User user);
}
