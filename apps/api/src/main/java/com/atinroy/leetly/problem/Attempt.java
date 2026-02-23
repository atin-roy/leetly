package com.atinroy.leetly.problem;

import com.atinroy.leetly.common.BaseEntity;
import com.atinroy.leetly.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "attempts")
public class Attempt extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private int attemptNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Language language;

    @Column(columnDefinition = "TEXT")
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Outcome outcome;

    @Column
    private Integer durationMinutes;

    @ElementCollection
    @CollectionTable(name = "attempt_mistakes", joinColumns = @JoinColumn(name = "attempt_id"))
    @Column(name = "mistake", nullable = false)
    @Enumerated(EnumType.STRING)
    @BatchSize(size = 20)
    private List<Mistake> mistakes = new ArrayList<>();

    @Column
    private String timeComplexity;

    @Column
    private String spaceComplexity;

    @Column(columnDefinition = "TEXT")
    private String aiReview;

    @Column(columnDefinition = "TEXT")
    private String learned;

    @Column(columnDefinition = "TEXT")
    private String takeaways;

    @Column(length = 5000)
    private String notes;
}
