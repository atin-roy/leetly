package com.atinroy.leetly.note;

import lombok.RequiredArgsConstructor;
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
    public List<NoteDto> findAll(@RequestParam(required = false) Long problemId,
                                 @RequestParam(required = false) NoteTag tag) {
        if (problemId != null) {
            return noteService.findByProblem(problemId).stream().map(noteMapper::toDto).toList();
        }
        if (tag != null) {
            return noteService.findByTag(tag).stream().map(noteMapper::toDto).toList();
        }
        return noteService.findAll().stream().map(noteMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public NoteDto findById(@PathVariable long id) {
        return noteMapper.toDto(noteService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NoteDto create(@RequestBody CreateNoteRequest request) {
        return noteMapper.toDto(noteService.create(request.problemId(), request.tag(), request.title(), request.content()));
    }

    @PutMapping("/{id}")
    public NoteDto update(@PathVariable long id, @RequestBody UpdateNoteRequest request) {
        return noteMapper.toDto(noteService.update(id, request.tag(), request.title(), request.content()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) {
        noteService.delete(id);
    }
}
