package com.atinroy.leetly.review.model;

import com.atinroy.leetly.problem.model.Attempt;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "review_logs")
public class ReviewLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "review_card_id", nullable = false)
    private ReviewCard reviewCard;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rating rating;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardState state;

    @Column(nullable = false)
    private double stability;

    @Column(nullable = false)
    private double difficulty;

    @Column(name = "elapsed_days", nullable = false)
    private int elapsedDays;

    @Column(name = "scheduled_days", nullable = false)
    private int scheduledDays;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_type", nullable = false)
    private ReviewType reviewType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id")
    private Attempt attempt;

    @Column(name = "reviewed_at", nullable = false)
    private LocalDateTime reviewedAt = LocalDateTime.now();
}
