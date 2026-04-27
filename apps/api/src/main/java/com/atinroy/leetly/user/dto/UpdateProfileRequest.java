package com.atinroy.leetly.user.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public record UpdateProfileRequest(
        @Size(max = 100) String displayName,
        @Size(max = 500) String bio,
        @Size(max = 500000) String avatarDataUrl,
        @Size(max = 255)
        @Pattern(
                regexp = "^$|^https://(www\\.)?leetcode\\.com(/.*)?$",
                message = "LeetCode URL must be a valid leetcode.com URL"
        )
        String leetcodeUrl,
        @Size(max = 255)
        @Pattern(
                regexp = "^$|^https://(www\\.)?github\\.com(/.*)?$",
                message = "GitHub URL must be a valid github.com URL"
        )
        String githubUrl,
        boolean progressPublic,
        boolean streakPublic,
        boolean listsPublic,
        boolean notesPublic
) {}
