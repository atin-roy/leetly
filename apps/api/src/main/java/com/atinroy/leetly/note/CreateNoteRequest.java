package com.atinroy.leetly.note;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateNoteRequest(Long problemId, @NotNull NoteTag tag, @NotBlank String title, String content) {}
