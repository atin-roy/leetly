package com.atinroy.leetly.note;

public record CreateNoteRequest(Long problemId, NoteTag tag, String title, String content) {}
