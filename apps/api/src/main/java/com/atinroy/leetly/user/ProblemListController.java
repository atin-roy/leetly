package com.atinroy.leetly.user;

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
    public ProblemListDto findById(@PathVariable long id) {
        return problemListMapper.toDto(problemListService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public ProblemListDto create(@AuthenticationPrincipal Jwt jwt,
                                 @RequestBody CreateProblemListRequest request) {
        User user = userService.getOrCreate(jwt.getSubject());
        return problemListMapper.toDto(problemListService.create(user, request.name()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) {
        problemListService.delete(id);
    }

    @PostMapping("/{id}/problems/{problemId}")
    @Transactional
    public ProblemListDto addProblem(@PathVariable long id, @PathVariable long problemId) {
        return problemListMapper.toDto(problemListService.addProblem(id, problemId));
    }

    @DeleteMapping("/{id}/problems/{problemId}")
    @Transactional
    public ProblemListDto removeProblem(@PathVariable long id, @PathVariable long problemId) {
        return problemListMapper.toDto(problemListService.removeProblem(id, problemId));
    }
}
