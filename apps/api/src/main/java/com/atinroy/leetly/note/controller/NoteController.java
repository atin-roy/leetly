package com.atinroy.leetly.note.controller;

import com.atinroy.leetly.common.model.PagedResponse;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.atinroy.leetly.note.dto.CreateNoteRequest;
import com.atinroy.leetly.note.dto.NoteDto;
import com.atinroy.leetly.note.dto.UpdateNoteRequest;
import com.atinroy.leetly.note.mapper.NoteMapper;
import com.atinroy.leetly.note.model.NoteTag;
import com.atinroy.leetly.note.service.NoteService;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;
    private final NoteMapper noteMapper;
    private final UserService userService;

    @GetMapping
    public PagedResponse<NoteDto> findAll(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) Long problemId,
            @RequestParam(required = false) NoteTag tag,
            @PageableDefault(size = 20, sort = "dateTime", direction = Sort.Direction.DESC) Pageable pageable) {
        User user = userService.getOrCreate(jwt.getSubject());
        if (problemId != null) {
            List<NoteDto> notes = noteService.findByProblem(problemId, user).stream().map(noteMapper::toDto).toList();
            return new PagedResponse<>(notes, 0, notes.size(), notes.size(), 1);
        }
        if (tag != null) {
            List<NoteDto> notes = noteService.findByTag(tag, user).stream().map(noteMapper::toDto).toList();
            return new PagedResponse<>(notes, 0, notes.size(), notes.size(), 1);
        }
        return PagedResponse.of(noteService.findAll(user, pageable).map(noteMapper::toDto));
    }

    @GetMapping("/{id}")
    public NoteDto findById(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        User user = userService.getOrCreate(jwt.getSubject());
        return noteMapper.toDto(noteService.findById(id, user));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NoteDto create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateNoteRequest request) {
        User user = userService.getOrCreate(jwt.getSubject());
        return noteMapper.toDto(noteService.create(user, request.problemId(), request.tag(), request.title(), request.content()));
    }

    @PatchMapping("/{id}")
    public NoteDto update(@AuthenticationPrincipal Jwt jwt, @PathVariable long id, @Valid @RequestBody UpdateNoteRequest request) {
        User user = userService.getOrCreate(jwt.getSubject());
        return noteMapper.toDto(noteService.update(id, user, request.tag(), request.title(), request.content()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        User user = userService.getOrCreate(jwt.getSubject());
        noteService.delete(id, user);
    }
}
