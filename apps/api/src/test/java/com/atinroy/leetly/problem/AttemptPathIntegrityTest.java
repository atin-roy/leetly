package com.atinroy.leetly.problem;

import com.atinroy.leetly.common.ResourceNotFoundException;
import com.atinroy.leetly.config.KeycloakJwtAuthenticationConverter;
import com.atinroy.leetly.user.User;
import com.atinroy.leetly.user.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifies that attempt endpoints enforce the problemId path parameter so that
 * an attempt belonging to a different problem cannot be retrieved via
 * /api/problems/{problemId}/attempts/{id}.
 */
@WebMvcTest(AttemptController.class)
class AttemptPathIntegrityTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    KeycloakJwtAuthenticationConverter keycloakJwtAuthenticationConverter;

    @MockitoBean
    AttemptService attemptService;

    @MockitoBean
    AttemptMapper attemptMapper;

    @MockitoBean
    UserService userService;

    @Test
    void getById_returns404WhenAttemptBelongsToDifferentProblem() throws Exception {
        User user = userWithId(1L);
        when(userService.getOrCreate("user")).thenReturn(user);

        // Attempt 5 belongs to problem 2, not problem 1
        when(attemptService.findByIdAndProblem(5L, 1L, user))
                .thenThrow(new ResourceNotFoundException("Attempt not found: 5"));

        mvc.perform(get("/api/problems/1/attempts/5")
                        .with(jwt()))
                .andExpect(status().isNotFound());
    }

    @Test
    void getById_returns401WithoutAuthentication() throws Exception {
        mvc.perform(get("/api/problems/1/attempts/5"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getById_returns200WhenAttemptMatchesProblem() throws Exception {
        User user = userWithId(1L);
        when(userService.getOrCreate("user")).thenReturn(user);

        Attempt attempt = new Attempt();
        AttemptDto dto = new AttemptDto(1L, 1L, 1, null, null, null, null, null, null, null, null, null, null, null, null);
        when(attemptService.findByIdAndProblem(5L, 1L, user)).thenReturn(attempt);
        when(attemptMapper.toDto(attempt)).thenReturn(dto);

        mvc.perform(get("/api/problems/1/attempts/5")
                        .with(jwt()))
                .andExpect(status().isOk());
    }

    private User userWithId(long id) {
        User user = new User();
        user.setId(id);
        return user;
    }
}
