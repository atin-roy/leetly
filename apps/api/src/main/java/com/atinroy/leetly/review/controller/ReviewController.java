package com.atinroy.leetly.review.controller;

import com.atinroy.leetly.review.dto.*;
import com.atinroy.leetly.review.mapper.ReviewMapper;
import com.atinroy.leetly.review.service.ReviewService;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review-cards")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewMapper reviewMapper;
    private final UserService userService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewCardDto enroll(@Valid @RequestBody EnrollReviewRequest request,
                                @AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return reviewMapper.toDto(reviewService.enroll(request.problemId(), user));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable long id,
                       @AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        reviewService.remove(id, user);
    }

    @GetMapping("/due")
    public Page<ReviewCardDto> findDue(Pageable pageable,
                                       @AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return reviewService.findDueCards(user, pageable).map(reviewMapper::toDto);
    }

    @GetMapping("/stats")
    public ReviewStatsDto stats(@AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return new ReviewStatsDto(
            reviewService.countDue(user),
            reviewService.countUpcoming7Days(user),
            reviewService.countTotal(user)
        );
    }

    @PostMapping("/{id}/review")
    public ReviewCardDto quickReview(@PathVariable long id,
                                     @Valid @RequestBody QuickReviewRequest request,
                                     @AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return reviewMapper.toDto(reviewService.quickReview(id, request.rating(), user));
    }

    @GetMapping("/{id}/history")
    public List<ReviewLogDto> history(@PathVariable long id,
                                      @AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return reviewService.findHistory(id, user).stream().map(reviewMapper::toLogDto).toList();
    }
}
