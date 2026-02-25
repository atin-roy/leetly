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
 * Verifies that /api/problems/* endpoints return 404 (not 403) when a user
 * accesses a problem they do not own, preventing IDOR.
 */
@WebMvcTest(ProblemController.class)
class ProblemOwnershipTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    KeycloakJwtAuthenticationConverter keycloakJwtAuthenticationConverter;

    @MockitoBean
    UserService userService;

    @MockitoBean
    ProblemService problemService;

    @MockitoBean
    ProblemMapper problemMapper;

    @Test
    void getById_returns404WhenProblemBelongsToAnotherUser() throws Exception {
        User alice = userWithId(1L);
        when(userService.getOrCreate("alice")).thenReturn(alice);
        when(problemService.findDetailById(99L, alice))
                .thenThrow(new ResourceNotFoundException("Problem not found: 99"));

        mvc.perform(get("/api/problems/99")
                        .with(jwt().jwt(j -> j.subject("alice"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void getById_returns401WithoutAuthentication() throws Exception {
        mvc.perform(get("/api/problems/99"))
                .andExpect(status().isUnauthorized());
    }

    private User userWithId(long id) {
        User user = new User();
        user.setId(id);
        return user;
    }
}
