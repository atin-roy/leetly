package com.atinroy.leetly.problem;

import com.atinroy.leetly.config.KeycloakJwtAuthenticationConverter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifies that bean validation constraints on request records are enforced
 * by the @Valid binding in ProblemController.
 */
@WebMvcTest(ProblemController.class)
class RequestValidationTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    KeycloakJwtAuthenticationConverter keycloakJwtAuthenticationConverter;

    @MockitoBean
    ProblemService problemService;

    @MockitoBean
    ProblemMapper problemMapper;

    @Test
    void createProblem_returns400WhenTitleIsBlank() throws Exception {
        String body = """
                {"leetcodeId": 1, "title": "", "url": "https://leetcode.com/1", "difficulty": "EASY"}
                """;

        mvc.perform(post("/api/problems")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(jwt()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createProblem_returns400WhenLeetcodeIdIsNotPositive() throws Exception {
        String body = """
                {"leetcodeId": -1, "title": "Two Sum", "url": "https://leetcode.com/1", "difficulty": "EASY"}
                """;

        mvc.perform(post("/api/problems")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(jwt()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createProblem_returns400WhenDifficultyIsNull() throws Exception {
        String body = """
                {"leetcodeId": 1, "title": "Two Sum", "url": "https://leetcode.com/1", "difficulty": null}
                """;

        mvc.perform(post("/api/problems")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(jwt()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createProblem_returns400WhenUrlIsBlank() throws Exception {
        String body = """
                {"leetcodeId": 1, "title": "Two Sum", "url": "  ", "difficulty": "EASY"}
                """;

        mvc.perform(post("/api/problems")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(jwt()))
                .andExpect(status().isBadRequest());
    }
}
