package com.atinroy.leetly.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyStatRepository extends JpaRepository<DailyStat, Long> {

    Optional<DailyStat> findByUserAndDate(User user, LocalDate date);

    List<DailyStat> findByUserAndDateBetween(User user, LocalDate from, LocalDate to);
}
