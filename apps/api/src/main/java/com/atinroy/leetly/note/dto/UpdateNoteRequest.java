package com.atinroy.leetly.note.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.atinroy.leetly.note.model.NoteTag;

public record UpdateNoteRequest(@NotNull NoteTag tag, @NotBlank String title, String content) {}
