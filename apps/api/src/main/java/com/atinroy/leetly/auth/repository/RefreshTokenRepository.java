package com.atinroy.leetly.auth.repository;

import com.atinroy.leetly.auth.model.RefreshToken;
import com.atinroy.leetly.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /**
     * A bulk update writes straight to the database and does not touch entities
     * already loaded in the persistence context. Without clearing it, a token
     * read back in the same transaction would still look un-revoked.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE RefreshToken t SET t.revokedAt = :now WHERE t.user = :user AND t.revokedAt IS NULL")
    int revokeAllForUser(@Param("user") User user, @Param("now") LocalDateTime now);
}
