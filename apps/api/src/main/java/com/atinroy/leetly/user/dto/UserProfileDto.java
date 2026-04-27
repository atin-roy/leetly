package com.atinroy.leetly.user.dto;

public record UserProfileDto(
        String displayName,
        String bio,
        String avatarDataUrl,
        String leetcodeUrl,
        String githubUrl,
        boolean progressPublic,
        boolean streakPublic,
        boolean listsPublic,
        boolean notesPublic
) {}
