package com.atinroy.leetly.user.model;

import com.atinroy.leetly.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "users",
        indexes = {
                @Index(name = "idx_user_subject_id", columnList = "subjectId", unique = true)
        })
public class User extends BaseEntity {

    /** Token subject. Carried over from the Keycloak user id at migration. */
    @Column(nullable = false, unique = true)
    private String subjectId;

    @Column(length = 255)
    private String passwordHash;

    @Column(length = 100)
    private String username;

    @Column(length = 255)
    private String email;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private UserSettings settings;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private UserStats stats;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DailyStat> dailyStats = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProblemList> problemLists = new ArrayList<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private UserProfile profile;
}
