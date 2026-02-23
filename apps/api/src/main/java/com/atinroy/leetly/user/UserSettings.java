package com.atinroy.leetly.user;

import com.atinroy.leetly.common.BaseEntity;
import com.atinroy.leetly.problem.Language;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "user_settings")
public class UserSettings extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    private Language preferredLanguage;

    @Column(nullable = false)
    private int dailyGoal = 1;

    @Column(nullable = false)
    private String timezone = "UTC";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theme_id")
    private Theme theme;
}
