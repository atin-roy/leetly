package com.atinroy.leetly.user;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/me/stats")
@RequiredArgsConstructor
public class StatsController {

    private final UserService userService;
    private final StatsService statsService;
    private final UserStatsMapper userStatsMapper;
    private final DailyStatMapper dailyStatMapper;

    @GetMapping
    public UserStatsDto getStats(@AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return userStatsMapper.toDto(statsService.getByUser(user));
    }

    @GetMapping("/daily")
    public List<DailyStatDto> getDailyStats(@AuthenticationPrincipal Jwt jwt,
                                             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        User user = userService.getOrCreate(jwt.getSubject());
        return statsService.getDailyStatsBetween(user, from, to).stream()
                .map(dailyStatMapper::toDto).toList();
    }
}
