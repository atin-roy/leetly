package com.atinroy.leetly.note;

import com.atinroy.leetly.common.PagedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;
    private final NoteMapper noteMapper;

    @GetMapping
    public PagedResponse<NoteDto> findAll(
            @RequestParam(required = false) Long problemId,
            @RequestParam(required = false) NoteTag tag,
            @PageableDefault(size = 20, sort = "dateTime", direction = Sort.Direction.DESC) Pageable pageable) {
        if (problemId != null) {
            List<NoteDto> notes = noteService.findByProblem(problemId).stream().map(noteMapper::toDto).toList();
            return new PagedResponse<>(notes, 0, notes.size(), notes.size(), 1);
        }
        if (tag != null) {
            List<NoteDto> notes = noteService.findByTag(tag).stream().map(noteMapper::toDto).toList();
            return new PagedResponse<>(notes, 0, notes.size(), notes.size(), 1);
        }
        return PagedResponse.of(noteService.findAll(pageable).map(noteMapper::toDto));
    }

    @GetMapping("/{id}")
    public NoteDto findById(@PathVariable long id) {
        return noteMapper.toDto(noteService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NoteDto create(@Valid @RequestBody CreateNoteRequest request) {
        return noteMapper.toDto(noteService.create(request.problemId(), request.tag(), request.title(), request.content()));
    }

    @PutMapping("/{id}")
    public NoteDto update(@PathVariable long id, @Valid @RequestBody UpdateNoteRequest request) {
        return noteMapper.toDto(noteService.update(id, request.tag(), request.title(), request.content()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) {
        noteService.delete(id);
    }
}
