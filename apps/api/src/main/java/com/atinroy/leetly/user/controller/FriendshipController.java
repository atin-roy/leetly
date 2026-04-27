package com.atinroy.leetly.user.controller;

import com.atinroy.leetly.user.dto.FriendOverviewDto;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.service.FriendshipService;
import com.atinroy.leetly.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me/friends")
@RequiredArgsConstructor
public class FriendshipController {

    private final UserService userService;
    private final FriendshipService friendshipService;

    @GetMapping
    public FriendOverviewDto getOverview(@AuthenticationPrincipal Jwt jwt) {
        User viewer = userService.getOrCreate(jwt);
        return friendshipService.getOverview(viewer);
    }

    @PostMapping("/requests/{id}/accept")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void accept(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        User viewer = userService.getOrCreate(jwt);
        friendshipService.acceptRequest(viewer, id);
    }

    @PostMapping("/requests/{id}/decline")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void decline(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        User viewer = userService.getOrCreate(jwt);
        friendshipService.declineRequest(viewer, id);
    }

    @DeleteMapping("/requests/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        User viewer = userService.getOrCreate(jwt);
        friendshipService.cancelOutgoingRequest(viewer, id);
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unfriend(@AuthenticationPrincipal Jwt jwt, @PathVariable long userId) {
        User viewer = userService.getOrCreate(jwt);
        friendshipService.unfriend(viewer, userId);
    }
}
