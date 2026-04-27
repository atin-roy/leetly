package com.atinroy.leetly.user.model;

import com.atinroy.leetly.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "user_profile")
public class UserProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 100)
    private String displayName;

    @Column(length = 500)
    private String bio;

    @Column(name = "avatar_data_url", columnDefinition = "TEXT")
    private String avatarDataUrl;

    @Column(name = "leetcode_url", length = 255)
    private String leetcodeUrl;

    @Column(name = "github_url", length = 255)
    private String githubUrl;

    @Column(nullable = false)
    private boolean progressPublic = true;

    @Column(nullable = false)
    private boolean streakPublic = true;

    @Column(nullable = false)
    private boolean listsPublic = false;

    @Column(nullable = false)
    private boolean notesPublic = false;
}
