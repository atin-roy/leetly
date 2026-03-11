package com.atinroy.leetly.user.controller;

import com.atinroy.leetly.common.model.PagedResponse;
import com.atinroy.leetly.problem.dto.ProblemSummaryDto;
import com.atinroy.leetly.problem.mapper.ProblemMapper;
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
import com.atinroy.leetly.user.dto.CreateProblemListRequest;
import com.atinroy.leetly.user.dto.ProblemListDto;
import com.atinroy.leetly.user.mapper.ProblemListMapper;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.service.ProblemListService;
import com.atinroy.leetly.user.service.UserService;

@RestController
@RequestMapping("/api/me/lists")
@RequiredArgsConstructor
public class ProblemListController {

    private final UserService userService;
    private final ProblemListService problemListService;
    private final ProblemListMapper problemListMapper;
    private final ProblemMapper problemMapper;

    @GetMapping
    @Transactional(readOnly = true)
    public List<ProblemListDto> findAll(@AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return problemListService.findByUser(user).stream().map(problemListMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ProblemListDto findById(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        User user = userService.getOrCreate(jwt.getSubject());
        return problemListMapper.toDto(problemListService.findByIdAndUser(id, user));
    }

    @GetMapping("/{id}/problems")
    @Transactional(readOnly = true)
    public PagedResponse<ProblemSummaryDto> findProblems(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable long id,
            @PageableDefault(size = 20, sort = {"createdDate", "id"}, direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) Long patternId,
            @RequestParam(required = false) String search
    ) {
        User user = userService.getOrCreate(jwt.getSubject());
        return PagedResponse.of(problemListService.findProblems(id, user, pageable, difficulty, status, topicId, patternId, search)
                .map(problemMapper::toSummaryDto));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public ProblemListDto create(@AuthenticationPrincipal Jwt jwt,
                                 @Valid @RequestBody CreateProblemListRequest request) {
        User user = userService.getOrCreate(jwt.getSubject());
        return problemListMapper.toDto(problemListService.create(user, request.name()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        User user = userService.getOrCreate(jwt.getSubject());
        problemListService.delete(id, user);
    }

    @PostMapping("/{id}/problems/{problemId}")
    @Transactional
    public ProblemListDto addProblem(@AuthenticationPrincipal Jwt jwt,
                                     @PathVariable long id,
                                     @PathVariable long problemId) {
        User user = userService.getOrCreate(jwt.getSubject());
        return problemListMapper.toDto(problemListService.addProblem(id, problemId, user));
    }

    @DeleteMapping("/{id}/problems/{problemId}")
    @Transactional
    public ProblemListDto removeProblem(@AuthenticationPrincipal Jwt jwt,
                                        @PathVariable long id,
                                        @PathVariable long problemId) {
        User user = userService.getOrCreate(jwt.getSubject());
        return problemListMapper.toDto(problemListService.removeProblem(id, problemId, user));
    }
}
