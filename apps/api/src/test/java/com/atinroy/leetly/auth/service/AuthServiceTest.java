package com.atinroy.leetly.auth.service;

import com.atinroy.leetly.auth.model.RefreshToken;
import com.atinroy.leetly.auth.repository.RefreshTokenRepository;
import com.atinroy.leetly.common.exception.ConflictException;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.repository.UserRepository;
import com.atinroy.leetly.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    static final Clock CLOCK = Clock.fixed(Instant.parse("2026-08-06T12:00:00Z"), ZoneId.of("UTC"));

    @Mock
    UserRepository userRepository;

    @Mock
    UserService userService;

    @Mock
    RefreshTokenRepository refreshTokenRepository;

    @Mock
    TokenService tokenService;

    PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository, userService, refreshTokenRepository,
                tokenService, passwordEncoder, CLOCK);

        lenient().when(tokenService.generateRefreshToken()).thenReturn("refresh-token");
        lenient().when(tokenService.hash(anyString())).thenAnswer(i -> "hash:" + i.getArgument(0));
        lenient().when(tokenService.getRefreshTokenTtl()).thenReturn(Duration.ofDays(30));
        lenient().when(tokenService.issueAccessToken(any())).thenReturn("access-token");
    }

    private User user(String email, String rawPassword) {
        User user = new User();
        user.setId(1L);
        user.setSubjectId("subject-1");
        user.setEmail(email);
        if (rawPassword != null) {
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
        }
        return user;
    }

    @Test
    void register_rejectsAnEmailThatAlreadyExists() {
        when(userRepository.findByEmailIgnoreCase("taken@example.com"))
                .thenReturn(Optional.of(user("taken@example.com", "password123")));

        assertThatThrownBy(() -> authService.register("Taken@Example.com", "someone", "password123"))
                .isInstanceOf(ConflictException.class);

        verify(userService, never()).provision(any(), any(), any(), any());
    }

    @Test
    void register_storesThePasswordAsAHashNotPlaintext() {
        when(userRepository.findByEmailIgnoreCase("new@example.com")).thenReturn(Optional.empty());
        when(userService.provision(any(), any(), any(), any())).thenReturn(user("new@example.com", "password123"));

        authService.register("New@Example.com", "newbie", "password123");

        ArgumentCaptor<String> hash = ArgumentCaptor.forClass(String.class);
        verify(userService).provision(any(), any(), any(), hash.capture());
        assertThat(hash.getValue()).isNotEqualTo("password123");
        assertThat(passwordEncoder.matches("password123", hash.getValue())).isTrue();
    }

    @Test
    void login_rejectsAWrongPassword() {
        when(userRepository.findByEmailIgnoreCase("user@example.com"))
                .thenReturn(Optional.of(user("user@example.com", "correct-password")));

        assertThatThrownBy(() -> authService.login("user@example.com", "wrong-password"))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void login_rejectsAnUnknownEmailWithTheSameErrorAsAWrongPassword() {
        when(userRepository.findByEmailIgnoreCase("ghost@example.com")).thenReturn(Optional.empty());

        // Identical message: distinguishing the two would let an attacker
        // enumerate which email addresses have accounts.
        assertThatThrownBy(() -> authService.login("ghost@example.com", "any-password"))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    void login_rejectsAnAccountMigratedWithoutALocalPassword() {
        when(userRepository.findByEmailIgnoreCase("legacy@example.com"))
                .thenReturn(Optional.of(user("legacy@example.com", null)));

        assertThatThrownBy(() -> authService.login("legacy@example.com", "anything"))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void refresh_rotatesTheTokenAndRetiresTheOldOne() {
        RefreshToken stored = storedToken(LocalDateTime.now(CLOCK).plusDays(1), null);
        when(refreshTokenRepository.findByTokenHash("hash:presented")).thenReturn(Optional.of(stored));

        authService.refresh("presented");

        assertThat(stored.getRevokedAt()).isEqualTo(LocalDateTime.now(CLOCK));
        assertThat(stored.getReplacedBy()).isEqualTo("hash:refresh-token");
    }

    @Test
    void refresh_revokesEveryTokenWhenAnAlreadyRotatedOneIsReplayed() {
        RefreshToken alreadyUsed = storedToken(
                LocalDateTime.now(CLOCK).plusDays(1), LocalDateTime.now(CLOCK).minusMinutes(5));
        when(refreshTokenRepository.findByTokenHash("hash:stolen")).thenReturn(Optional.of(alreadyUsed));

        assertThatThrownBy(() -> authService.refresh("stolen"))
                .isInstanceOf(BadCredentialsException.class);

        // Replay means the token leaked, so the whole family is cut off.
        verify(refreshTokenRepository).revokeAllForUser(alreadyUsed.getUser(), LocalDateTime.now(CLOCK));
    }

    @Test
    void refresh_rejectsAnExpiredToken() {
        RefreshToken expired = storedToken(LocalDateTime.now(CLOCK).minusDays(1), null);
        when(refreshTokenRepository.findByTokenHash("hash:old")).thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> authService.refresh("old"))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void refresh_rejectsATokenThatWasNeverIssued() {
        when(refreshTokenRepository.findByTokenHash("hash:forged")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refresh("forged"))
                .isInstanceOf(BadCredentialsException.class);
    }

    private RefreshToken storedToken(LocalDateTime expiresAt, LocalDateTime revokedAt) {
        RefreshToken token = new RefreshToken();
        token.setUser(user("user@example.com", "password123"));
        token.setTokenHash("hash:stored");
        token.setExpiresAt(expiresAt);
        token.setRevokedAt(revokedAt);
        return token;
    }
}
