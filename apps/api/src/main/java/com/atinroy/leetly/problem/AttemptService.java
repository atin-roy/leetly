package com.atinroy.leetly.problem;

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
    public List<Attempt> findByProblem(long problemId) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found: " + problemId));
        return attemptRepository.findByProblem(problem);
    }

    @Transactional(readOnly = true)
    public Attempt findById(long id) {
        return attemptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attempt not found: " + id));
    }

    public Attempt logAttempt(long problemId, User user, LogAttemptRequest request) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found: " + problemId));

        int attemptNumber = (int) attemptRepository.countByProblem(problem) + 1;

        Attempt attempt = new Attempt();
        attempt.setProblem(problem);
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
        attempt = attemptRepository.save(attempt);

        boolean wasUnseen = problem.getStatus() == ProblemStatus.UNSEEN;
        boolean isAccepted = request.outcome() == Outcome.ACCEPTED;
        boolean wasSolved = problem.getStatus() == ProblemStatus.SOLVED
                || problem.getStatus() == ProblemStatus.SOLVED_WITH_HELP
                || problem.getStatus() == ProblemStatus.MASTERED;

        boolean isFirstSolve = false;
        if (isAccepted && !wasSolved) {
            problem.setStatus(ProblemStatus.SOLVED);
            isFirstSolve = true;
            problemRepository.save(problem);
        } else if (!isAccepted && wasUnseen) {
            problem.setStatus(ProblemStatus.ATTEMPTED);
            problemRepository.save(problem);
        }

        statsService.updateOnAttempt(user, attempt, isFirstSolve);

        return attempt;
    }

    public Attempt update(long id, LogAttemptRequest request) {
        Attempt attempt = findById(id);
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

    public void delete(long id) {
        attemptRepository.deleteById(id);
    }
}
