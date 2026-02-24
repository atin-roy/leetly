package com.atinroy.leetly.user;

public record UserProfileDto(
        String displayName,
        String bio,
        boolean progressPublic,
        boolean streakPublic,
        boolean listsPublic,
        boolean notesPublic
) {}
