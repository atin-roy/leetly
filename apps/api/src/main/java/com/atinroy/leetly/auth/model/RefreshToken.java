package com.atinroy.leetly.auth.model;

import com.atinroy.leetly.common.model.BaseEntity;
import com.atinroy.leetly.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * A refresh token, stored only as a SHA-256 digest so that read access to the
 * table does not yield a usable token.
 */
@Getter
@Setter
@Entity
@Table(name = "refresh_tokens",
        indexes = {
                @Index(name = "idx_refresh_token_hash", columnList = "tokenHash", unique = true),
                @Index(name = "idx_refresh_token_user", columnList = "user_id")
        })
public class RefreshToken extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private LocalDateTime revokedAt;

    /** Digest of the token that superseded this one, set on rotation. */
    @Column(length = 64)
    private String replacedBy;

    public boolean isActive(LocalDateTime now) {
        return revokedAt == null && expiresAt.isAfter(now);
    }
}
