package com.atinroy.leetly.user.controller;

import com.atinroy.leetly.config.LeetlyJwtAuthenticationConverter;
import com.atinroy.leetly.config.SecurityConfig;
import com.atinroy.leetly.user.dto.UserStatsDto;
import com.atinroy.leetly.user.mapper.DailyStatMapper;
import com.atinroy.leetly.user.mapper.UserStatsMapper;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.model.UserStats;
import com.atinroy.leetly.user.service.StatsService;
import com.atinroy.leetly.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StatsController.class)
@Import(SecurityConfig.class)
class StatsControllerTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    LeetlyJwtAuthenticationConverter jwtAuthenticationConverter;

    @MockitoBean
    JwtDecoder jwtDecoder;

    @MockitoBean
    UserService userService;

    @MockitoBean
    StatsService statsService;

    @MockitoBean
    UserStatsMapper userStatsMapper;

    @MockitoBean
    DailyStatMapper dailyStatMapper;

    @Test
    void getStats_returns401WithoutAuthentication() throws Exception {
        mvc.perform(get("/api/me/stats"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getStats_returnsDtoForAuthenticatedUser() throws Exception {
        User user = new User();
        user.setId(1L);
        UserStats stats = new UserStats();
        UserStatsDto dto = new UserStatsDto(
                1L, 12, 0, 0, 3, 5, 5, 2, 15, 10, 320, 4, 9,
                null, 2, 8, 3, 2, "{}", "{}");

        when(userService.requireBySubject("alice")).thenReturn(user);
        when(statsService.getByUser(user)).thenReturn(stats);
        when(userStatsMapper.toDto(stats)).thenReturn(dto);

        mvc.perform(get("/api/me/stats")
                        .with(jwt().jwt(j -> j.subject("alice"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSolved").value(12))
                .andExpect(jsonPath("$.currentStreak").value(4));
    }
}
