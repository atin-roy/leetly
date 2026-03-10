package com.atinroy.leetly.note.dto;

import java.time.LocalDateTime;
import com.atinroy.leetly.note.model.Note;
import com.atinroy.leetly.note.model.NoteTag;

public record NoteDto(
        Long id,
        Long problemId,
        LocalDateTime dateTime,
        NoteTag tag,
        String title,
        String content
) {
    public static NoteDto from(Note note) {
        return new NoteDto(
                note.getId(),
                note.getProblem() != null ? note.getProblem().getId() : null,
                note.getDateTime(),
                note.getTag(),
                note.getTitle(),
                note.getContent()
        );
    }
}
