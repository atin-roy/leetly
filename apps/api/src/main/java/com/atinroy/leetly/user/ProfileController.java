package com.atinroy.leetly.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;
    private final UserProfileService userProfileService;
    private final UserProfileMapper userProfileMapper;

    @GetMapping
    public UserProfileDto get(@AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return userProfileMapper.toDto(userProfileService.getByUser(user));
    }

    @PutMapping
    public UserProfileDto update(@AuthenticationPrincipal Jwt jwt,
                                 @Valid @RequestBody UpdateProfileRequest request) {
        User user = userService.getOrCreate(jwt.getSubject());
        return userProfileMapper.toDto(userProfileService.update(user, request));
    }
}
