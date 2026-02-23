package com.atinroy.leetly.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyStatRepository extends JpaRepository<DailyStat, Long> {

    Optional<DailyStat> findByUserAndDate(User user, LocalDate date);

    List<DailyStat> findByUserAndDateBetween(User user, LocalDate from, LocalDate to);

    @Query("SELECT COALESCE(SUM(d.solved), 0) FROM DailyStat d WHERE d.user = :user AND d.date >= :startDate")
    int sumSolvedSince(@Param("user") User user, @Param("startDate") LocalDate startDate);
}
