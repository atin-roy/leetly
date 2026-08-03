package com.atinroy.leetly.auth.controller;

import com.atinroy.leetly.auth.service.AuthService;
import com.atinroy.leetly.auth.service.TokenService;
import com.atinroy.leetly.config.LeetlyJwtAuthenticationConverter;
import com.atinroy.leetly.config.SecurityConfig;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Duration;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
class AuthControllerTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    LeetlyJwtAuthenticationConverter jwtAuthenticationConverter;

    @MockitoBean
    JwtDecoder jwtDecoder;

    @MockitoBean
    AuthService authService;

    @MockitoBean
    TokenService tokenService;

    @MockitoBean
    UserService userService;

    private User userWithId(long id) {
        User user = new User();
        user.setId(id);
        user.setEmail("alice@example.com");
        user.setUsername("alice");
        return user;
    }

    @Test
    void login_returnsTokens_onValidCredentials() throws Exception {
        User user = userWithId(1L);
        when(authService.login("alice@example.com", "password123"))
                .thenReturn(new AuthService.TokenPair("access-token", "refresh-token", user));
        when(tokenService.getAccessTokenTtl()).thenReturn(Duration.ofMinutes(15));

        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"alice@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.user.email").value("alice@example.com"));
    }

    @Test
    void login_returnsBadRequest_onBlankPassword() throws Exception {
        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"alice@example.com\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_returnsCreated_onValidPayload() throws Exception {
        User user = userWithId(2L);
        when(authService.register(anyString(), any(), anyString()))
                .thenReturn(new AuthService.TokenPair("access-token", "refresh-token", user));
        when(tokenService.getAccessTokenTtl()).thenReturn(Duration.ofMinutes(15));

        mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"alice@example.com\",\"username\":\"alice\",\"password\":\"password123\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void register_returnsBadRequest_onShortPassword() throws Exception {
        mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"alice@example.com\",\"username\":\"alice\",\"password\":\"short\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void me_returns401WithoutAuthentication() throws Exception {
        mvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_returnsIdentity_whenAuthenticated() throws Exception {
        User user = userWithId(3L);
        when(userService.requireBySubject("alice")).thenReturn(user);

        mvc.perform(get("/api/auth/me")
                        .with(jwt().jwt(j -> j.subject("alice"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("alice@example.com"));
    }
}
