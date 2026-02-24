package com.atinroy.leetly.user;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 100) String displayName,
        @Size(max = 500) String bio,
        boolean progressPublic,
        boolean streakPublic,
        boolean listsPublic,
        boolean notesPublic
) {}
