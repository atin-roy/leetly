package com.atinroy.leetly.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me/settings")
@RequiredArgsConstructor
public class UserSettingsController {

    private final UserService userService;
    private final UserSettingsService userSettingsService;
    private final UserSettingsMapper userSettingsMapper;

    @GetMapping
    public UserSettingsDto get(@AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return userSettingsMapper.toDto(userSettingsService.getByUser(user));
    }

    @PatchMapping("/language")
    public UserSettingsDto updateLanguage(@AuthenticationPrincipal Jwt jwt,
                                          @Valid @RequestBody UpdateLanguageRequest request) {
        User user = userService.getOrCreate(jwt.getSubject());
        return userSettingsMapper.toDto(userSettingsService.updateLanguage(user, request.language()));
    }

    @PatchMapping("/daily-goal")
    public UserSettingsDto updateDailyGoal(@AuthenticationPrincipal Jwt jwt,
                                           @Valid @RequestBody UpdateDailyGoalRequest request) {
        User user = userService.getOrCreate(jwt.getSubject());
        return userSettingsMapper.toDto(userSettingsService.updateDailyGoal(user, request.dailyGoal()));
    }

    @PatchMapping("/timezone")
    public UserSettingsDto updateTimezone(@AuthenticationPrincipal Jwt jwt,
                                          @Valid @RequestBody UpdateTimezoneRequest request) {
        User user = userService.getOrCreate(jwt.getSubject());
        return userSettingsMapper.toDto(userSettingsService.updateTimezone(user, request.timezone()));
    }

    @PatchMapping("/theme")
    public UserSettingsDto updateTheme(@AuthenticationPrincipal Jwt jwt,
                                       @RequestBody UpdateThemeRequest request) {
        User user = userService.getOrCreate(jwt.getSubject());
        return userSettingsMapper.toDto(userSettingsService.updateTheme(user, request.themeId()));
    }
}
