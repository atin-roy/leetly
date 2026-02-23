package com.atinroy.leetly.user;

import com.atinroy.leetly.common.ResourceNotFoundException;
import com.atinroy.leetly.config.KeycloakJwtAuthenticationConverter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifies that /api/me/lists/* endpoints return 404 (not 403) when a user
 * attempts to access a list that belongs to another user, preventing IDOR.
 */
@WebMvcTest(ProblemListController.class)
class ProblemListOwnershipTest {

    @Autowired
    MockMvc mvc;

    // Required by SecurityConfig constructor; bypassed by jwt() post-processor
    @MockitoBean
    KeycloakJwtAuthenticationConverter keycloakJwtAuthenticationConverter;

    @MockitoBean
    UserService userService;

    @MockitoBean
    ProblemListService problemListService;

    @MockitoBean
    ProblemListMapper problemListMapper;

    @Test
    void getById_returns404WhenListBelongsToAnotherUser() throws Exception {
        User alice = userWithId(1L);
        when(userService.getOrCreate("alice")).thenReturn(alice);
        when(problemListService.findByIdAndUser(99L, alice))
                .thenThrow(new ResourceNotFoundException("ProblemList not found: 99"));

        mvc.perform(get("/api/me/lists/99")
                        .with(jwt().jwt(j -> j.subject("alice"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_returns404WhenListBelongsToAnotherUser() throws Exception {
        User alice = userWithId(1L);
        when(userService.getOrCreate("alice")).thenReturn(alice);
        doThrow(new ResourceNotFoundException("ProblemList not found: 42"))
                .when(problemListService).delete(42L, alice);

        mvc.perform(delete("/api/me/lists/42")
                        .with(jwt().jwt(j -> j.subject("alice"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void getById_returns401WithoutAuthentication() throws Exception {
        mvc.perform(get("/api/me/lists/1"))
                .andExpect(status().isUnauthorized());
    }

    // --

    private User userWithId(long id) {
        User user = new User();
        user.setId(id);
        return user;
    }
}
