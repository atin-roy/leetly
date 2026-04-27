package com.atinroy.leetly.user.dto;

public record SocialUserDto(
        Long id,
        String username,
        String displayName,
        String avatarDataUrl,
        String bio,
        FriendshipState friendshipState,
        Long friendshipRequestId
) {}
