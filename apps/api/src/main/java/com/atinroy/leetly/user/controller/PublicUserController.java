package com.atinroy.leetly.user.controller;

import com.atinroy.leetly.common.model.PagedResponse;
import com.atinroy.leetly.user.dto.PublicUserProfileDto;
import com.atinroy.leetly.user.dto.SocialUserDto;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.service.FriendshipService;
import com.atinroy.leetly.user.service.PublicProfileService;
import com.atinroy.leetly.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class PublicUserController {

    private final UserService userService;
    private final FriendshipService friendshipService;
    private final PublicProfileService publicProfileService;

    @GetMapping
    public PagedResponse<SocialUserDto> discover(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 24) Pageable pageable
    ) {
        User viewer = userService.getOrCreate(jwt);
        return PagedResponse.of(friendshipService.discoverUsers(viewer, search, pageable));
    }

    @GetMapping("/{id}/profile")
    public PublicUserProfileDto getProfile(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        User viewer = userService.getOrCreate(jwt);
        return publicProfileService.getProfile(viewer, id);
    }

    @PostMapping("/{id}/friend-requests")
    @ResponseStatus(HttpStatus.CREATED)
    public SocialUserDto sendFriendRequest(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        User viewer = userService.getOrCreate(jwt);
        friendshipService.sendRequest(viewer, id);
        User subject = userService.findById(id);
        FriendshipService.FriendshipView view = friendshipService.getFriendshipView(viewer, subject);
        return new SocialUserDto(
                subject.getId(),
                subject.getUsername(),
                subject.getProfile() != null && subject.getProfile().getDisplayName() != null && !subject.getProfile().getDisplayName().isBlank()
                        ? subject.getProfile().getDisplayName().trim()
                        : (subject.getUsername() != null && !subject.getUsername().isBlank() ? subject.getUsername().trim() : "User " + subject.getId()),
                subject.getProfile() != null ? subject.getProfile().getAvatarDataUrl() : null,
                subject.getProfile() != null ? subject.getProfile().getBio() : null,
                view.state(),
                view.requestId()
        );
    }
}
