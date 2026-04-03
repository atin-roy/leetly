package com.atinroy.leetly.review.repository;

import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.review.model.ReviewCard;
import com.atinroy.leetly.user.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ReviewCardRepository extends JpaRepository<ReviewCard, Long> {

    Optional<ReviewCard> findByProblemAndUser(Problem problem, User user);

    Optional<ReviewCard> findByIdAndUser(Long id, User user);

    @Query("SELECT rc FROM ReviewCard rc WHERE rc.user = :user AND rc.due <= :now ORDER BY rc.due ASC")
    Page<ReviewCard> findDueCards(@Param("user") User user, @Param("now") LocalDateTime now, Pageable pageable);

    @Query("SELECT COUNT(rc) FROM ReviewCard rc WHERE rc.user = :user AND rc.due <= :now")
    long countDue(@Param("user") User user, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(rc) FROM ReviewCard rc WHERE rc.user = :user AND rc.due > :now AND rc.due <= :until")
    long countUpcoming(@Param("user") User user, @Param("now") LocalDateTime now, @Param("until") LocalDateTime until);

    long countByUser(User user);

    void deleteByProblemAndUser(Problem problem, User user);

    boolean existsByProblemAndUser(Problem problem, User user);
}
