package com.atinroy.leetly.user.model;

import com.atinroy.leetly.common.model.BaseEntity;
import com.atinroy.leetly.problem.model.Problem;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "problem_lists")
public class ProblemList extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private boolean isDefault = false;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "problem_list_problems",
            joinColumns = @JoinColumn(name = "problem_list_id"),
            inverseJoinColumns = @JoinColumn(name = "problem_id")
    )
    private List<Problem> problems = new ArrayList<>();
}
