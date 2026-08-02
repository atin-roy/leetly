package com.atinroy.leetly.auth.dto;

/**
 * Both tokens are returned in the body: this API is consumed by the web app's
 * server, which puts the refresh token into a first-party httpOnly cookie on
 * its own origin. Setting that cookie here instead would make it third-party to
 * the web app — and browsers that block third-party cookies would silently
 * break session renewal. The refresh token never reaches the browser.
 */
public record AuthResponse(
        String accessToken,
        String refreshToken,
        long expiresIn,
        UserIdentity user) {

    public record UserIdentity(long id, String email, String username) {
    }
}
