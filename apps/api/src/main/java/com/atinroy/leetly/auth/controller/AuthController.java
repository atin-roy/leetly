package com.atinroy.leetly.auth.controller;

import com.atinroy.leetly.auth.dto.AuthResponse;
import com.atinroy.leetly.auth.dto.ChangePasswordRequest;
import com.atinroy.leetly.auth.dto.LoginRequest;
import com.atinroy.leetly.auth.dto.RefreshRequest;
import com.atinroy.leetly.auth.dto.RegisterRequest;
import com.atinroy.leetly.auth.service.AuthService;
import com.atinroy.leetly.auth.service.TokenService;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenService tokenService;
    private final UserService userService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return respond(authService.register(request.email(), request.username(), request.password()));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return respond(authService.login(request.email(), request.password()));
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return respond(authService.refresh(request.refreshToken()));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@RequestBody(required = false) RefreshRequest request) {
        authService.logout(request == null ? null : request.refreshToken());
    }

    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(
                userService.requireBySubject(jwt.getSubject()),
                request.currentPassword(),
                request.newPassword());
    }

    @GetMapping("/me")
    public AuthResponse.UserIdentity me(@AuthenticationPrincipal Jwt jwt) {
        User user = userService.requireBySubject(jwt.getSubject());
        return new AuthResponse.UserIdentity(user.getId(), user.getEmail(), user.getUsername());
    }

    private AuthResponse respond(AuthService.TokenPair pair) {
        User user = pair.user();
        return new AuthResponse(
                pair.accessToken(),
                pair.refreshToken(),
                tokenService.getAccessTokenTtl().toSeconds(),
                new AuthResponse.UserIdentity(user.getId(), user.getEmail(), user.getUsername()));
    }
}
