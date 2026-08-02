package com.atinroy.leetly.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Exercises the real filter chain: tokens issued here are verified by the same
 * decoder that guards every other endpoint.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthFlowIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    private JsonNode register(String email) throws Exception {
        String body = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","username":"tester","password":"password123"}
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body);
    }

    @Test
    void registeredUserCanCallAProtectedEndpointWithTheIssuedToken() throws Exception {
        JsonNode tokens = register("flow@example.com");

        mockMvc.perform(get("/api/problems")
                        .header("Authorization", "Bearer " + tokens.get("accessToken").asText()))
                .andExpect(status().isOk());
    }

    @Test
    void protectedEndpointRejectsAMissingToken() throws Exception {
        mockMvc.perform(get("/api/problems")).andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointRejectsAForgedToken() throws Exception {
        mockMvc.perform(get("/api/problems").header("Authorization", "Bearer not-a-real-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registeringTheSameEmailTwiceConflicts() throws Exception {
        register("duplicate@example.com");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"duplicate@example.com","username":"other","password":"password123"}
                                """))
                .andExpect(status().isConflict());
    }

    @Test
    void loginReturnsAWorkingTokenForTheRightPassword() throws Exception {
        register("login@example.com");

        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"login@example.com","password":"password123"}
                                """))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + objectMapper.readTree(body).get("accessToken").asText()))
                .andExpect(status().isOk());
    }

    @Test
    void loginWithTheWrongPasswordIsRejected() throws Exception {
        register("wrongpass@example.com");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"wrongpass@example.com","password":"not-the-password"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refreshIssuesANewTokenAndInvalidatesTheOldOne() throws Exception {
        String firstRefresh = register("rotate@example.com").get("refreshToken").asText();

        String body = mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"%s"}
                                """.formatted(firstRefresh)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertThat(objectMapper.readTree(body).get("refreshToken").asText()).isNotEqualTo(firstRefresh);

        // Replaying the rotated token must not work.
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"%s"}
                                """.formatted(firstRefresh)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void changingThePasswordSwitchesWhichCredentialsWork() throws Exception {
        String token = register("rotatepw@example.com").get("accessToken").asText();

        mockMvc.perform(post("/api/auth/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"currentPassword":"password123","newPassword":"a-brand-new-password"}
                                """))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"rotatepw@example.com","password":"password123"}
                                """))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"rotatepw@example.com","password":"a-brand-new-password"}
                                """))
                .andExpect(status().isOk());
    }

    @Test
    void changingThePasswordRequiresTheCurrentOne() throws Exception {
        String token = register("guardpw@example.com").get("accessToken").asText();

        mockMvc.perform(post("/api/auth/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"currentPassword":"guessing","newPassword":"a-brand-new-password"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void changingThePasswordEndsSessionsOnOtherDevices() throws Exception {
        JsonNode tokens = register("sessions@example.com");
        String otherDeviceRefresh = tokens.get("refreshToken").asText();

        mockMvc.perform(post("/api/auth/change-password")
                        .header("Authorization", "Bearer " + tokens.get("accessToken").asText())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"currentPassword":"password123","newPassword":"a-brand-new-password"}
                                """))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"%s"}
                                """.formatted(otherDeviceRefresh)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void oneUserCannotSeeAnotherUsersProblems() throws Exception {
        String alice = register("alice@example.com").get("accessToken").asText();
        String bob = register("bob@example.com").get("accessToken").asText();

        mockMvc.perform(post("/api/problems")
                        .header("Authorization", "Bearer " + alice)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"leetcodeId":1,"title":"Two Sum","url":"https://leetcode.com/problems/two-sum/","difficulty":"EASY"}
                                """))
                .andExpect(status().isCreated());

        // Alice sees it, so an empty result for Bob is real isolation and not
        // simply an endpoint that returns nothing.
        String alicesProblems = mockMvc.perform(get("/api/problems")
                        .header("Authorization", "Bearer " + alice))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        assertThat(objectMapper.readTree(alicesProblems).get("content")).hasSize(1);

        String bobsProblems = mockMvc.perform(get("/api/problems")
                        .header("Authorization", "Bearer " + bob))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        assertThat(objectMapper.readTree(bobsProblems).get("content")).isEmpty();
    }
}
