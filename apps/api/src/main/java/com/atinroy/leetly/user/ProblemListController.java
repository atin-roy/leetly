package com.atinroy.leetly.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me/lists")
@RequiredArgsConstructor
public class ProblemListController {

    private final UserService userService;
    private final ProblemListService problemListService;
    private final ProblemListMapper problemListMapper;

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
