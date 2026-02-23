package com.atinroy.leetly.note;

import java.time.LocalDateTime;

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
