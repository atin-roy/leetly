package com.atinroy.leetly.problem.controller;

import com.atinroy.leetly.common.model.PagedResponse;
import com.atinroy.leetly.review.model.ReviewCard;
import com.atinroy.leetly.review.repository.ReviewCardRepository;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.atinroy.leetly.problem.dto.CreateProblemRequest;
import com.atinroy.leetly.problem.dto.ProblemCountsDto;
import com.atinroy.leetly.problem.dto.ProblemDetailDto;
import com.atinroy.leetly.problem.dto.ProblemRefDto;
import com.atinroy.leetly.problem.dto.ProblemSummaryDto;
import com.atinroy.leetly.problem.dto.RemoveTopicsRequest;
import com.atinroy.leetly.problem.dto.UpdateStatusRequest;
import com.atinroy.leetly.problem.mapper.ProblemMapper;
import com.atinroy.leetly.problem.service.ProblemService;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final UserService userService;
    private final ProblemService problemService;
    private final ProblemMapper problemMapper;
    private final ReviewCardRepository reviewCardRepository;

    @GetMapping
    public PagedResponse<ProblemSummaryDto> findAll(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 20, sort = {"createdDate", "id"}, direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) Long patternId,
            @RequestParam(required = false) String search) {
        User user = userService.requireBySubject(jwt.getSubject());
        return PagedResponse.of(problemService.findAll(user, pageable, difficulty, status, topicId, patternId, search));
    }

    /**
     * Identity pairs for every problem the user owns. The client uses this to
     * flag already-added problems; fetching full rows for that was pulling the
     * user's entire library on page load.
     */
    @GetMapping("/refs")
    public List<ProblemRefDto> findRefs(@AuthenticationPrincipal Jwt jwt) {
        User user = userService.requireBySubject(jwt.getSubject());
        return problemService.findRefs(user);
    }

    /**
     * Aggregate counts for the dashboard, which previously derived them by
     * fetching a 1000-row page of full problem rows on every load.
     */
    @GetMapping("/counts")
    public ProblemCountsDto findCounts(@AuthenticationPrincipal Jwt jwt) {
        User user = userService.requireBySubject(jwt.getSubject());
        return problemService.findCounts(user);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ProblemDetailDto findById(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        User user = userService.requireBySubject(jwt.getSubject());
        var problem = problemService.findDetailById(id, user);
        var dto = problemMapper.toDetailDto(problem);
        return reviewCardRepository.findByProblemAndUser(problem, user)
                .map(card -> dto.withReviewCard(new ProblemDetailDto.ReviewCardSummary(
                        card.getId(), card.getState().name(), card.getDue(),
                        card.getReps(), card.getLapses(), card.getStability())))
                .orElse(dto);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProblemSummaryDto create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateProblemRequest request) {
        User user = userService.requireBySubject(jwt.getSubject());
        return problemMapper.toSummaryDto(problemService.create(request, user));
    }

    @PutMapping("/{id}")
    public ProblemSummaryDto update(@AuthenticationPrincipal Jwt jwt, @PathVariable long id, @Valid @RequestBody CreateProblemRequest request) {
        User user = userService.requireBySubject(jwt.getSubject());
        return problemMapper.toSummaryDto(problemService.update(id, request, user));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        User user = userService.requireBySubject(jwt.getSubject());
        problemService.delete(id, user);
    }

    @PatchMapping("/{id}/status")
    public ProblemSummaryDto updateStatus(@AuthenticationPrincipal Jwt jwt, @PathVariable long id, @Valid @RequestBody UpdateStatusRequest request) {
        User user = userService.requireBySubject(jwt.getSubject());
        return problemMapper.toSummaryDto(problemService.updateStatus(id, request.status(), user));
    }

    @PostMapping("/{id}/topics/{topicId}")
    @Transactional
    public ProblemDetailDto addTopic(@AuthenticationPrincipal Jwt jwt, @PathVariable long id, @PathVariable long topicId) {
        User user = userService.requireBySubject(jwt.getSubject());
        return problemMapper.toDetailDto(problemService.addTopic(id, topicId, user));
    }

    @DeleteMapping("/{id}/topics")
    @Transactional
    public ProblemDetailDto removeTopics(@AuthenticationPrincipal Jwt jwt, @PathVariable long id, @Valid @RequestBody RemoveTopicsRequest request) {
        User user = userService.requireBySubject(jwt.getSubject());
        return problemMapper.toDetailDto(problemService.removeTopics(id, request.topicIds(), user));
    }

    @PostMapping("/{id}/patterns/{patternId}")
    @Transactional
    public ProblemDetailDto addPattern(@AuthenticationPrincipal Jwt jwt, @PathVariable long id, @PathVariable long patternId) {
        User user = userService.requireBySubject(jwt.getSubject());
        return problemMapper.toDetailDto(problemService.addPattern(id, patternId, user));
    }

    @DeleteMapping("/{id}/patterns/{patternId}")
    @Transactional
    public ProblemDetailDto removePattern(@AuthenticationPrincipal Jwt jwt, @PathVariable long id, @PathVariable long patternId) {
        User user = userService.requireBySubject(jwt.getSubject());
        return problemMapper.toDetailDto(problemService.removePattern(id, patternId, user));
    }

    @PostMapping("/{id}/related/{relatedId}")
    @Transactional
    public ProblemDetailDto addRelatedProblem(@AuthenticationPrincipal Jwt jwt, @PathVariable long id, @PathVariable long relatedId) {
        User user = userService.requireBySubject(jwt.getSubject());
        return problemMapper.toDetailDto(problemService.addRelatedProblem(id, relatedId, user));
    }
}
