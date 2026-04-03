package com.atinroy.leetly.review.repository;

import com.atinroy.leetly.review.model.ReviewCard;
import com.atinroy.leetly.review.model.ReviewLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewLogRepository extends JpaRepository<ReviewLog, Long> {

    List<ReviewLog> findByReviewCardOrderByReviewedAtDesc(ReviewCard reviewCard);
}
