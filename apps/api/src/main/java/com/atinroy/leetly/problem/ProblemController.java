package com.atinroy.leetly.problem;

import com.atinroy.leetly.common.PagedResponse;
import com.atinroy.leetly.user.User;
import com.atinroy.leetly.user.UserService;
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

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final UserService userService;
    private final ProblemService problemService;
    private final ProblemMapper problemMapper;

    @GetMapping
    public PagedResponse<ProblemSummaryDto> findAll(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 20, sort = "leetcodeId", direction = Sort.Direction.ASC) Pageable pageable,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) Long patternId,
            @RequestParam(required = false) String search) {
        User user = userService.getOrCreate(jwt.getSubject());
        return PagedResponse.of(problemService.findAll(user, pageable, difficulty, status, topicId, patternId, search).map(problemMapper::toSummaryDto));
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ProblemDetailDto findById(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        User user = userService.getOrCreate(jwt.getSubject());
        return problemMapper.toDetailDto(problemService.findDetailById(id, user));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProblemSummaryDto create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateProblemRequest request) {
        User user = userService.getOrCreate(jwt.getSubject());
        return problemMapper.toSummaryDto(problemService.create(request, user));
    }

    @PutMapping("/{id}")
    public ProblemSummaryDto update(@AuthenticationPrincipal Jwt jwt, @PathVariable long id, @Valid @RequestBody CreateProblemRequest request) {
        User user = userService.getOrCreate(jwt.getSubject());
        return problemMapper.toSummaryDto(problemService.update(id, request, user));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        User user = userService.getOrCreate(jwt.getSubject());
        problemService.delete(id, user);
    }

    @PatchMapping("/{id}/status")
    public ProblemSummaryDto updateStatus(@AuthenticationPrincipal Jwt jwt, @PathVariable long id, @Valid @RequestBody UpdateStatusRequest request) {
        User user = userService.getOrCreate(jwt.getSubject());
        return problemMapper.toSummaryDto(problemService.updateStatus(id, request.status(), user));
    }

    @PostMapping("/{id}/topics/{topicId}")
    @Transactional
    public ProblemDetailDto addTopic(@AuthenticationPrincipal Jwt jwt, @PathVariable long id, @PathVariable long topicId) {
        User user = userService.getOrCreate(jwt.getSubject());
        return problemMapper.toDetailDto(problemService.addTopic(id, topicId, user));
    }

    @DeleteMapping("/{id}/topics")
    @Transactional
    public ProblemDetailDto removeTopics(@AuthenticationPrincipal Jwt jwt, @PathVariable long id, @Valid @RequestBody RemoveTopicsRequest request) {
        User user = userService.getOrCreate(jwt.getSubject());
        return problemMapper.toDetailDto(problemService.removeTopics(id, request.topicIds(), user));
    }

    @PostMapping("/{id}/patterns/{patternId}")
    @Transactional
    public ProblemDetailDto addPattern(@AuthenticationPrincipal Jwt jwt, @PathVariable long id, @PathVariable long patternId) {
        User user = userService.getOrCreate(jwt.getSubject());
        return problemMapper.toDetailDto(problemService.addPattern(id, patternId, user));
    }

    @DeleteMapping("/{id}/patterns/{patternId}")
    @Transactional
    public ProblemDetailDto removePattern(@AuthenticationPrincipal Jwt jwt, @PathVariable long id, @PathVariable long patternId) {
        User user = userService.getOrCreate(jwt.getSubject());
        return problemMapper.toDetailDto(problemService.removePattern(id, patternId, user));
    }

    @PostMapping("/{id}/related/{relatedId}")
    @Transactional
    public ProblemDetailDto addRelatedProblem(@AuthenticationPrincipal Jwt jwt, @PathVariable long id, @PathVariable long relatedId) {
        User user = userService.getOrCreate(jwt.getSubject());
        return problemMapper.toDetailDto(problemService.addRelatedProblem(id, relatedId, user));
    }
}
