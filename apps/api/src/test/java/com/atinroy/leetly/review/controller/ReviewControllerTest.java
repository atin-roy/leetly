package com.atinroy.leetly.review.controller;

import com.atinroy.leetly.config.LeetlyJwtAuthenticationConverter;
import com.atinroy.leetly.config.SecurityConfig;
import com.atinroy.leetly.review.dto.ReviewStatsDto;
import com.atinroy.leetly.review.mapper.ReviewMapper;
import com.atinroy.leetly.review.service.ReviewService;
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

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReviewController.class)
@Import(SecurityConfig.class)
class ReviewControllerTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    LeetlyJwtAuthenticationConverter jwtAuthenticationConverter;

    @MockitoBean
    JwtDecoder jwtDecoder;

    @MockitoBean
    UserService userService;

    @MockitoBean
    ReviewService reviewService;

    @MockitoBean
    ReviewMapper reviewMapper;

    @Test
    void findDue_returns401WithoutAuthentication() throws Exception {
        mvc.perform(get("/api/review-cards/due"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void enroll_returns400WhenProblemIdMissing() throws Exception {
        mvc.perform(post("/api/review-cards")
                        .with(jwt().jwt(j -> j.subject("alice")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void stats_returnsCountsForAuthenticatedUser() throws Exception {
        User user = new User();
        user.setId(1L);
        when(userService.requireBySubject("alice")).thenReturn(user);
        when(reviewService.countDue(user)).thenReturn(3L);
        when(reviewService.countUpcoming7Days(user)).thenReturn(5L);
        when(reviewService.countTotal(user)).thenReturn(20L);

        mvc.perform(get("/api/review-cards/stats")
                        .with(jwt().jwt(j -> j.subject("alice"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dueNow").value(3))
                .andExpect(jsonPath("$.upcoming7Days").value(5))
                .andExpect(jsonPath("$.totalEnrolled").value(20));
    }
}
