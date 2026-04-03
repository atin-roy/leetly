package com.atinroy.leetly.problem.service;

import com.atinroy.leetly.common.exception.ResourceNotFoundException;
import com.atinroy.leetly.review.service.ReviewService;
import com.atinroy.leetly.user.service.StatsService;
import com.atinroy.leetly.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import com.atinroy.leetly.problem.dto.LogAttemptRequest;
import com.atinroy.leetly.problem.model.Attempt;
import com.atinroy.leetly.problem.model.Outcome;
import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.problem.model.ProblemStatus;
import com.atinroy.leetly.problem.repository.AttemptRepository;
import com.atinroy.leetly.problem.repository.ProblemRepository;

@Service
@Transactional
@RequiredArgsConstructor
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final ProblemRepository problemRepository;
    private final StatsService statsService;
    private final ReviewService reviewService;

    @Transactional(readOnly = true)
    public List<Attempt> findByProblem(long problemId, User user) {
        Problem problem = problemRepository.findByIdAndUser(problemId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + problemId));
        return attemptRepository.findByProblemAndUser(problem, user);
    }

    @Transactional(readOnly = true)
    public Attempt findByIdAndProblem(long id, long problemId, User user) {
        return attemptRepository.findByIdAndProblemIdAndUser(id, problemId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found: " + id));
    }

    public Attempt logAttempt(long problemId, User user, LogAttemptRequest request) {
        // Pessimistic lock prevents two concurrent requests from reading the same
        // attempt count and assigning duplicate attempt numbers for the same user/problem.
        Problem problem = problemRepository.findByIdForUpdateAndUser(problemId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + problemId));

        int attemptNumber = (int) attemptRepository.countByProblemAndUser(problem, user) + 1;

        Attempt attempt = new Attempt();
        attempt.setProblem(problem);
        attempt.setUser(user);
        attempt.setAttemptNumber(attemptNumber);
        attempt.setLanguage(request.language());
        attempt.setCode(request.code());
        attempt.setApproach(request.approach());
        attempt.setOutcome(request.outcome());
        attempt.setDurationMinutes(resolveDurationMinutes(request));
        attempt.setMistakes(request.mistakes() != null ? request.mistakes() : List.of());
        attempt.setTimeComplexity(request.timeComplexity());
        attempt.setSpaceComplexity(request.spaceComplexity());
        attempt.setAiReview(request.aiReview());
        attempt.setLearned(request.learned());
        attempt.setTakeaways(request.takeaways());
        attempt.setNotes(request.notes());
        attempt.setStartedAt(request.startedAt());
        attempt.setEndedAt(request.endedAt());
        Attempt savedAttempt = attemptRepository.save(attempt);

        boolean isAccepted = request.outcome() == Outcome.ACCEPTED;
        boolean noOtherAccepted = attemptRepository
                .findByProblemAndUserAndOutcome(problem, user, Outcome.ACCEPTED)
                .stream().filter(a -> !a.getId().equals(savedAttempt.getId())).findAny().isEmpty();
        boolean isFirstSolve = isAccepted && noOtherAccepted;

        if (isFirstSolve) {
            problem.setStatus(ProblemStatus.SOLVED);
        } else if (!isAccepted && problem.getStatus() == ProblemStatus.UNSEEN) {
            problem.setStatus(ProblemStatus.ATTEMPTED);
        }

        problem.setLastAttemptedAt(savedAttempt.getCreatedDate());
        problemRepository.save(problem);

        statsService.updateOnAttempt(user, savedAttempt, isFirstSolve);

        if (isFirstSolve) {
            reviewService.autoEnrollOnFirstSolve(problem, user);
        }
        reviewService.onAttemptLogged(problem, user, savedAttempt);

        return savedAttempt;
    }

    public Attempt update(long id, long problemId, User user, LogAttemptRequest request) {
        Attempt attempt = findByIdAndProblem(id, problemId, user);
        statsService.adjustOnAttemptUpdate(user, attempt, request);
        attempt.setLanguage(request.language());
        attempt.setCode(request.code());
        attempt.setApproach(request.approach());
        attempt.setOutcome(request.outcome());
        attempt.setDurationMinutes(resolveDurationMinutes(request));
        attempt.setMistakes(request.mistakes() != null ? request.mistakes() : List.of());
        attempt.setTimeComplexity(request.timeComplexity());
        attempt.setSpaceComplexity(request.spaceComplexity());
        attempt.setAiReview(request.aiReview());
        attempt.setLearned(request.learned());
        attempt.setTakeaways(request.takeaways());
        attempt.setNotes(request.notes());
        attempt.setStartedAt(request.startedAt());
        attempt.setEndedAt(request.endedAt());
        return attemptRepository.save(attempt);
    }

    public void delete(long id, long problemId, User user) {
        Attempt attempt = findByIdAndProblem(id, problemId, user);
        Problem problem = attempt.getProblem();
        statsService.adjustOnAttemptDelete(user, attempt, attemptRepository);
        attemptRepository.delete(attempt);

        problem.setLastAttemptedAt(
                attemptRepository.findMaxCreatedDateByProblemAndUser(problem, user).orElse(null));
        problemRepository.save(problem);
    }

    private Integer resolveDurationMinutes(LogAttemptRequest request) {
        LocalDateTime startedAt = request.startedAt();
        LocalDateTime endedAt = request.endedAt();

        if (startedAt != null && endedAt != null && !endedAt.isBefore(startedAt)) {
            long seconds = Duration.between(startedAt, endedAt).getSeconds();
            if (seconds <= 0) return 0;
            return Math.max(1, (int) Math.ceil(seconds / 60.0));
        }

        return request.durationMinutes();
    }
}
