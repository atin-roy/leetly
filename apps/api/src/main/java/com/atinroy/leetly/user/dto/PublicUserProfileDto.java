package com.atinroy.leetly.user.dto;

import java.util.List;

public record PublicUserProfileDto(
        Long userId,
        String username,
        String displayName,
        String bio,
        String avatarDataUrl,
        String leetcodeUrl,
        String githubUrl,
        boolean isOwnProfile,
        boolean progressPublic,
        boolean streakPublic,
        boolean listsPublic,
        boolean notesPublic,
        FriendshipState friendshipState,
        Long friendshipRequestId,
        PublicUserStatsDto stats,
        List<PublicProblemListDto> lists,
        List<PublicNoteDto> notes
) {}
