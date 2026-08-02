package com.atinroy.leetly.auth.service;

import com.atinroy.leetly.auth.model.RefreshToken;
import com.atinroy.leetly.auth.repository.RefreshTokenRepository;
import com.atinroy.leetly.common.exception.ConflictException;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.repository.UserRepository;
import com.atinroy.leetly.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    /** An access token plus the opaque refresh token that renews it. */
    public record TokenPair(String accessToken, String refreshToken, User user) {
    }

    public TokenPair register(String email, String username, String rawPassword) {
        String normalizedEmail = email.trim().toLowerCase();
        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new ConflictException("An account with that email already exists");
        }

        User user = userService.provision(
                UUID.randomUUID().toString(),
                normalizedEmail,
                username == null || username.isBlank() ? normalizedEmail : username.trim(),
                passwordEncoder.encode(rawPassword));

        return issue(user);
    }

    public TokenPair login(String email, String rawPassword) {
        User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Accounts migrated from the external identity provider have no local
        // password until one is set, and must not be treated as passwordless.
        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return issue(user);
    }

    /**
     * Exchanges a refresh token for a new pair and retires the old one. If a
     * token that has already been rotated is presented again, every token for
     * that user is revoked: it means the token was captured and replayed.
     */
    public TokenPair refresh(String presentedToken) {
        LocalDateTime now = LocalDateTime.now(clock);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenService.hash(presentedToken))
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (!stored.isActive(now)) {
            refreshTokenRepository.revokeAllForUser(stored.getUser(), now);
            throw new BadCredentialsException("Refresh token is no longer valid");
        }

        TokenPair pair = issue(stored.getUser());
        stored.setRevokedAt(now);
        stored.setReplacedBy(tokenService.hash(pair.refreshToken()));
        refreshTokenRepository.save(stored);
        return pair;
    }

    /**
     * Changes the password and revokes every refresh token for the account, so
     * sessions on other devices cannot outlive the password they were
     * established with.
     */
    public void changePassword(User user, String currentPassword, String newPassword) {
        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        refreshTokenRepository.revokeAllForUser(user, LocalDateTime.now(clock));
    }

    public void logout(String presentedToken) {
        if (presentedToken == null || presentedToken.isBlank()) return;

        refreshTokenRepository.findByTokenHash(tokenService.hash(presentedToken))
                .ifPresent(token -> {
                    token.setRevokedAt(LocalDateTime.now(clock));
                    refreshTokenRepository.save(token);
                });
    }

    private TokenPair issue(User user) {
        String refreshToken = tokenService.generateRefreshToken();

        RefreshToken record = new RefreshToken();
        record.setUser(user);
        record.setTokenHash(tokenService.hash(refreshToken));
        record.setExpiresAt(LocalDateTime.now(clock).plus(tokenService.getRefreshTokenTtl()));
        refreshTokenRepository.save(record);

        return new TokenPair(tokenService.issueAccessToken(user), refreshToken, user);
    }
}
