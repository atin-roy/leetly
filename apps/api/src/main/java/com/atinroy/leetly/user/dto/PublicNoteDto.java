package com.atinroy.leetly.user.dto;

import com.atinroy.leetly.note.model.NoteTag;

import java.time.LocalDateTime;

public record PublicNoteDto(
        Long id,
        Long problemId,
        LocalDateTime dateTime,
        NoteTag tag,
        String title,
        String content
) {}
