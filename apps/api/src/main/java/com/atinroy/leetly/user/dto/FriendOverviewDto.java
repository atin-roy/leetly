package com.atinroy.leetly.user.dto;

import java.util.List;

public record FriendOverviewDto(
        List<SocialUserDto> friends,
        List<SocialUserDto> incomingRequests,
        List<SocialUserDto> outgoingRequests
) {}
