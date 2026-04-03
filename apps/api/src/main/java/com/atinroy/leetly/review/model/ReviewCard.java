package com.atinroy.leetly.review.model;

import com.atinroy.leetly.common.model.BaseEntity;
import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "review_cards", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"problem_id", "user_id"})
})
public class ReviewCard extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardState state = CardState.NEW;

    @Column(nullable = false)
    private double stability = 0.0;

    @Column(nullable = false)
    private double difficulty = 0.0;

    @Column(nullable = false)
    private LocalDateTime due = LocalDateTime.now();

    @Column(name = "last_review")
    private LocalDateTime lastReview;

    @Column(nullable = false)
    private int reps = 0;

    @Column(nullable = false)
    private int lapses = 0;

    @Column(name = "scheduled_days", nullable = false)
    private int scheduledDays = 0;

    @Column(name = "elapsed_days", nullable = false)
    private int elapsedDays = 0;
}
