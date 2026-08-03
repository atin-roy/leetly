package com.atinroy.leetly.user.controller;

import com.atinroy.leetly.common.exception.ResourceNotFoundException;
import com.atinroy.leetly.config.LeetlyJwtAuthenticationConverter;
import com.atinroy.leetly.config.SecurityConfig;
import com.atinroy.leetly.note.dto.NoteDto;
import com.atinroy.leetly.note.mapper.NoteMapper;
import com.atinroy.leetly.note.model.Note;
import com.atinroy.leetly.note.model.NoteTag;
import com.atinroy.leetly.user.dto.ProblemListDto;
import com.atinroy.leetly.user.mapper.ProblemListMapper;
import com.atinroy.leetly.user.model.ProblemList;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.service.FriendshipService;
import com.atinroy.leetly.user.service.ImportService;
import com.atinroy.leetly.user.service.PublicProfileService;
import com.atinroy.leetly.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifies the /api/users/{id}/lists/{listId}/import and
 * /api/users/{id}/notes/{noteId}/import routes are wired to ImportService and
 * that a non-friend gets 404 (not the raw content), matching the IDOR-safe
 * pattern used elsewhere in this controller layer.
 */
@WebMvcTest(PublicUserController.class)
@Import(SecurityConfig.class)
class PublicUserImportTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    LeetlyJwtAuthenticationConverter jwtAuthenticationConverter;

    @MockitoBean
    JwtDecoder jwtDecoder;

    @MockitoBean
    UserService userService;

    @MockitoBean
    FriendshipService friendshipService;

    @MockitoBean
    PublicProfileService publicProfileService;

    @MockitoBean
    ImportService importService;

    @MockitoBean
    ProblemListMapper problemListMapper;

    @MockitoBean
    NoteMapper noteMapper;

    @Test
    void importList_returnsCreatedListForFriend() throws Exception {
        User viewer = userWithId(1L);
        when(userService.requireBySubject((org.springframework.security.oauth2.jwt.Jwt) org.mockito.ArgumentMatchers.any())).thenReturn(viewer);

        ProblemList imported = new ProblemList();
        imported.setId(20L);
        when(importService.importList(viewer, 2L, 10L)).thenReturn(imported);
        when(problemListMapper.toDto(imported)).thenReturn(
                new ProblemListDto(20L, "Grind 75", false, java.util.List.of()));

        mvc.perform(post("/api/users/2/lists/10/import")
                        .with(jwt().jwt(j -> j.subject("viewer"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(20));
    }

    @Test
    void importList_returns404WhenNotFriends() throws Exception {
        User viewer = userWithId(1L);
        when(userService.requireBySubject((org.springframework.security.oauth2.jwt.Jwt) org.mockito.ArgumentMatchers.any())).thenReturn(viewer);
        when(importService.importList(viewer, 2L, 10L))
                .thenThrow(new ResourceNotFoundException("User not found: 2"));

        mvc.perform(post("/api/users/2/lists/10/import")
                        .with(jwt().jwt(j -> j.subject("viewer"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void importNote_returnsCreatedNoteForFriend() throws Exception {
        User viewer = userWithId(1L);
        when(userService.requireBySubject((org.springframework.security.oauth2.jwt.Jwt) org.mockito.ArgumentMatchers.any())).thenReturn(viewer);

        Note imported = new Note();
        imported.setId(40L);
        when(importService.importNote(viewer, 2L, 30L)).thenReturn(imported);
        when(noteMapper.toDto(imported)).thenReturn(
                new NoteDto(40L, null, LocalDateTime.now(), NoteTag.STRATEGY, "Two pointer trick", "Shrink from both ends"));

        mvc.perform(post("/api/users/2/notes/30/import")
                        .with(jwt().jwt(j -> j.subject("viewer"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(40));
    }

    @Test
    void importList_returns401WithoutAuthentication() throws Exception {
        mvc.perform(post("/api/users/2/lists/10/import"))
                .andExpect(status().isUnauthorized());
    }

    private User userWithId(long id) {
        User user = new User();
        user.setId(id);
        return user;
    }
}
