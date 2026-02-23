package com.atinroy.leetly.problem;

import com.atinroy.leetly.user.User;
import com.atinroy.leetly.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problems/{problemId}/attempts")
@RequiredArgsConstructor
public class AttemptController {

    private final AttemptService attemptService;
    private final AttemptMapper attemptMapper;
    private final UserService userService;

    @GetMapping
    public List<AttemptDto> findByProblem(@PathVariable long problemId,
                                          @AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return attemptService.findByProblem(problemId, user).stream().map(attemptMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public AttemptDto findById(@PathVariable long problemId,
                               @PathVariable long id,
                               @AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return attemptMapper.toDto(attemptService.findByIdAndProblem(id, problemId, user));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AttemptDto logAttempt(@PathVariable long problemId,
                                 @Valid @RequestBody LogAttemptRequest request,
                                 @AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return attemptMapper.toDto(attemptService.logAttempt(problemId, user, request));
    }

    @PutMapping("/{id}")
    public AttemptDto update(@PathVariable long problemId,
                             @PathVariable long id,
                             @Valid @RequestBody LogAttemptRequest request,
                             @AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return attemptMapper.toDto(attemptService.update(id, problemId, user, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long problemId, @PathVariable long id,
                       @AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        attemptService.delete(id, problemId, user);
    }
}
