package com.atinroy.leetly.problem;

import com.atinroy.leetly.common.ResourceNotFoundException;
import com.atinroy.leetly.user.StatsService;
import com.atinroy.leetly.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final ProblemRepository problemRepository;
    private final StatsService statsService;

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
        attempt.setOutcome(request.outcome());
        attempt.setDurationMinutes(request.durationMinutes());
        attempt.setMistakes(request.mistakes() != null ? request.mistakes() : List.of());
        attempt.setTimeComplexity(request.timeComplexity());
        attempt.setSpaceComplexity(request.spaceComplexity());
        attempt.setAiReview(request.aiReview());
        attempt.setLearned(request.learned());
        attempt.setTakeaways(request.takeaways());
        attempt.setNotes(request.notes());
        Attempt savedAttempt = attemptRepository.save(attempt);

        boolean isAccepted = request.outcome() == Outcome.ACCEPTED;
        boolean noOtherAccepted = attemptRepository
                .findByProblemAndUserAndOutcome(problem, user, Outcome.ACCEPTED)
                .stream().filter(a -> !a.getId().equals(savedAttempt.getId())).findAny().isEmpty();
        boolean isFirstSolve = isAccepted && noOtherAccepted;

        if (isFirstSolve) {
            problem.setStatus(ProblemStatus.SOLVED);
            problemRepository.save(problem);
        } else if (!isAccepted && problem.getStatus() == ProblemStatus.UNSEEN) {
            problem.setStatus(ProblemStatus.ATTEMPTED);
            problemRepository.save(problem);
        }

        statsService.updateOnAttempt(user, savedAttempt, isFirstSolve);

        return savedAttempt;
    }

    public Attempt update(long id, long problemId, User user, LogAttemptRequest request) {
        Attempt attempt = findByIdAndProblem(id, problemId, user);
        statsService.adjustOnAttemptUpdate(user, attempt, request);
        attempt.setLanguage(request.language());
        attempt.setCode(request.code());
        attempt.setOutcome(request.outcome());
        attempt.setDurationMinutes(request.durationMinutes());
        attempt.setMistakes(request.mistakes() != null ? request.mistakes() : List.of());
        attempt.setTimeComplexity(request.timeComplexity());
        attempt.setSpaceComplexity(request.spaceComplexity());
        attempt.setAiReview(request.aiReview());
        attempt.setLearned(request.learned());
        attempt.setTakeaways(request.takeaways());
        attempt.setNotes(request.notes());
        return attemptRepository.save(attempt);
    }

    public void delete(long id, long problemId, User user) {
        Attempt attempt = findByIdAndProblem(id, problemId, user);
        statsService.adjustOnAttemptDelete(user, attempt, attemptRepository);
        attemptRepository.delete(attempt);
    }
}
