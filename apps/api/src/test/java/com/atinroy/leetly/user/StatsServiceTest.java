package com.atinroy.leetly.user;

import com.atinroy.leetly.problem.Attempt;
import com.atinroy.leetly.problem.AttemptRepository;
import com.atinroy.leetly.problem.Difficulty;
import com.atinroy.leetly.problem.LogAttemptRequest;
import com.atinroy.leetly.problem.Mistake;
import com.atinroy.leetly.problem.Outcome;
import com.atinroy.leetly.problem.Pattern;
import com.atinroy.leetly.problem.Problem;
import com.atinroy.leetly.problem.ProblemRepository;
import com.atinroy.leetly.problem.ProblemStatus;
import com.atinroy.leetly.problem.Topic;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatsServiceTest {

    @Mock
    UserStatsRepository userStatsRepository;

    @Mock
    ProblemRepository problemRepository;

    @Mock
    AttemptRepository attemptRepository;

    @Mock
    DailyStatRepository dailyStatRepository;

    StatsService statsService;

    @BeforeEach
    void setUp() {
        statsService = new StatsService(
                userStatsRepository,
                problemRepository,
                attemptRepository,
                dailyStatRepository,
                new ObjectMapper());
        lenient().when(dailyStatRepository.findByUserAndDate(any(), any())).thenReturn(Optional.empty());
        lenient().when(problemRepository.findAllByUser(any())).thenReturn(List.of());
        lenient().when(attemptRepository.findByUserOrderByCreatedDateAsc(any())).thenReturn(List.of());
    }

    @Test
    void updateOnAttempt_incrementsTotalAttempts() {
        User user = new User();
        UserStats stats = statsWithAttempts(3);
        when(userStatsRepository.findByUser(user)).thenReturn(Optional.of(stats));

        statsService.updateOnAttempt(user, attempt(Outcome.WRONG_ANSWER, Difficulty.EASY, 1), false);

        assertThat(stats.getTotalAttempts()).isEqualTo(4);
        verify(userStatsRepository).save(stats);
    }

    @Test
    void updateOnAttempt_incrementsTotalSolvedAndDifficultyCountOnFirstSolve() {
        User user = new User();
        UserStats stats = statsWithAttempts(1);
        stats.setTotalSolved(5);
        stats.setMediumSolved(2);
        when(userStatsRepository.findByUser(user)).thenReturn(Optional.of(stats));

        statsService.updateOnAttempt(user, attempt(Outcome.ACCEPTED, Difficulty.MEDIUM, 1), true);

        assertThat(stats.getTotalSolved()).isEqualTo(6);
        assertThat(stats.getMediumSolved()).isEqualTo(3);
        assertThat(stats.getFirstAttemptSolves()).isEqualTo(1);
    }

    @Test
    void updateOnAttempt_doesNotIncrementTotalSolvedWhenNotFirstSolve() {
        User user = new User();
        UserStats stats = statsWithAttempts(2);
        stats.setTotalSolved(3);
        when(userStatsRepository.findByUser(user)).thenReturn(Optional.of(stats));

        statsService.updateOnAttempt(user, attempt(Outcome.ACCEPTED, Difficulty.HARD, 2), false);

        assertThat(stats.getTotalSolved()).isEqualTo(3);
    }

    @Test
    void adjustOnAttemptDelete_decrementsTotalAttempts() {
        User user = new User();
        UserStats stats = statsWithAttempts(5);
        when(userStatsRepository.findByUser(user)).thenReturn(Optional.of(stats));

        AttemptRepository mockAttemptRepo = mock(AttemptRepository.class);
        Attempt attempt = attempt(Outcome.WRONG_ANSWER, Difficulty.EASY, 1);
        attempt.setId(10L);
        when(mockAttemptRepo.findByProblemAndUserAndOutcome(any(), any(), any()))
                .thenReturn(List.of());

        statsService.adjustOnAttemptDelete(user, attempt, mockAttemptRepo);

        assertThat(stats.getTotalAttempts()).isEqualTo(4);
        verify(userStatsRepository).save(stats);
    }

    @Test
    void adjustOnAttemptDelete_decrementsTotalSolvedWhenDeletingOnlyAcceptedAttempt() {
        User user = new User();
        UserStats stats = statsWithAttempts(2);
        stats.setTotalSolved(3);
        stats.setEasySolved(1);
        when(userStatsRepository.findByUser(user)).thenReturn(Optional.of(stats));

        AttemptRepository mockAttemptRepo = mock(AttemptRepository.class);
        Attempt attempt = attempt(Outcome.ACCEPTED, Difficulty.EASY, 1);
        attempt.setId(10L);
        when(mockAttemptRepo.findByProblemAndUserAndOutcome(any(), any(), any()))
                .thenReturn(List.of(attempt));

        statsService.adjustOnAttemptDelete(user, attempt, mockAttemptRepo);

        assertThat(stats.getTotalSolved()).isEqualTo(2);
        assertThat(stats.getEasySolved()).isEqualTo(0);
    }

    @Test
    void adjustOnAttemptDelete_doesNotDecrementTotalSolvedWhenAnotherAcceptedAttemptExists() {
        User user = new User();
        UserStats stats = statsWithAttempts(3);
        stats.setTotalSolved(3);
        when(userStatsRepository.findByUser(user)).thenReturn(Optional.of(stats));

        AttemptRepository mockAttemptRepo = mock(AttemptRepository.class);
        Attempt attempt = attempt(Outcome.ACCEPTED, Difficulty.HARD, 2);
        attempt.setId(10L);

        Attempt otherAccepted = attempt(Outcome.ACCEPTED, Difficulty.HARD, 1);
        otherAccepted.setId(99L);
        when(mockAttemptRepo.findByProblemAndUserAndOutcome(any(), any(), any()))
                .thenReturn(List.of(attempt, otherAccepted));

        statsService.adjustOnAttemptDelete(user, attempt, mockAttemptRepo);

        assertThat(stats.getTotalSolved()).isEqualTo(3);
    }

    @Test
    void adjustOnAttemptUpdate_adjustsTimeDelta() {
        User user = new User();
        UserStats stats = new UserStats();
        stats.setTotalTimeMinutes(60);
        when(userStatsRepository.findByUser(user)).thenReturn(Optional.of(stats));

        Attempt oldAttempt = attempt(Outcome.WRONG_ANSWER, Difficulty.EASY, 1);
        oldAttempt.setDurationMinutes(30);

        LogAttemptRequest newRequest = new LogAttemptRequest(
                null, null, Outcome.WRONG_ANSWER, 45, List.of(),
                null, null, null, null, null, null);

        statsService.adjustOnAttemptUpdate(user, oldAttempt, newRequest);

        assertThat(stats.getTotalTimeMinutes()).isEqualTo(75);
    }

    @Test
    void getByUser_recalculatesStatsFromProblemsAndAttempts() {
        User user = new User();
        UserStats stats = new UserStats();
        when(userStatsRepository.findByUser(user)).thenReturn(Optional.of(stats));

        LocalDate today = LocalDate.now();
        Problem solved = problem(1L, ProblemStatus.SOLVED, Difficulty.EASY, today.minusDays(1));
        Problem solvedWithHelp = problem(2L, ProblemStatus.SOLVED_WITH_HELP, Difficulty.MEDIUM, today);
        Problem mastered = problem(3L, ProblemStatus.MASTERED, Difficulty.HARD, today.minusDays(2));
        Problem attempted = problem(4L, ProblemStatus.ATTEMPTED, Difficulty.MEDIUM, today.minusDays(3));
        solved.getTopics().add(topic(10L));
        solvedWithHelp.getTopics().add(topic(11L));
        mastered.getPatterns().add(pattern(20L));
        solvedWithHelp.getPatterns().add(pattern(21L));

        when(problemRepository.findAllByUser(user)).thenReturn(List.of(solved, solvedWithHelp, mastered, attempted));

        Attempt firstTrySolve = attempt(Outcome.ACCEPTED, Difficulty.EASY, 1);
        firstTrySolve.setProblem(solved);
        firstTrySolve.setDurationMinutes(30);
        firstTrySolve.setMistakes(List.of(Mistake.OFF_BY_ONE));
        firstTrySolve.setCreatedDate(today.minusDays(1).atStartOfDay());

        Attempt helpedSolve = attempt(Outcome.ACCEPTED, Difficulty.MEDIUM, 2);
        helpedSolve.setProblem(solvedWithHelp);
        helpedSolve.setDurationMinutes(45);
        helpedSolve.setMistakes(List.of(Mistake.WRONG_PATTERN, Mistake.OFF_BY_ONE));
        helpedSolve.setCreatedDate(today.atStartOfDay());

        Attempt failedAttempt = attempt(Outcome.WRONG_ANSWER, Difficulty.MEDIUM, 1);
        failedAttempt.setProblem(attempted);
        failedAttempt.setDurationMinutes(15);
        failedAttempt.setMistakes(List.of(Mistake.WRONG_PATTERN));
        failedAttempt.setCreatedDate(today.minusDays(3).atStartOfDay());

        when(attemptRepository.findByUserOrderByCreatedDateAsc(user))
                .thenReturn(List.of(firstTrySolve, helpedSolve, failedAttempt));

        UserStats result = statsService.getByUser(user);

        assertThat(result.getTotalSolved()).isEqualTo(1);
        assertThat(result.getTotalSolvedWithHelp()).isEqualTo(1);
        assertThat(result.getTotalMastered()).isEqualTo(1);
        assertThat(result.getTotalAttempted()).isEqualTo(4);
        assertThat(result.getEasySolved()).isEqualTo(1);
        assertThat(result.getMediumSolved()).isEqualTo(1);
        assertThat(result.getHardSolved()).isEqualTo(1);
        assertThat(result.getTotalAttempts()).isEqualTo(3);
        assertThat(result.getFirstAttemptSolves()).isEqualTo(1);
        assertThat(result.getTotalTimeMinutes()).isEqualTo(90);
        assertThat(result.getSolvedThisWeek()).isEqualTo(3);
        assertThat(result.getSolvedThisMonth()).isEqualTo(3);
        assertThat(result.getDistinctTopicsCovered()).isEqualTo(2);
        assertThat(result.getDistinctPatternsCovered()).isEqualTo(2);
        assertThat(result.getLastSolvedDate()).isEqualTo(today);
        assertThat(result.getLongestStreak()).isEqualTo(3);
        assertThat(result.getCurrentStreak()).isEqualTo(3);
        assertThat(result.getMistakeBreakdown()).contains("OFF_BY_ONE");
        assertThat(result.getMistakeBreakdown()).contains("WRONG_PATTERN");
    }

    @Test
    void getDailyStatsBetween_recalculatesDailyActivity() {
        User user = new User();
        Problem solved = problem(1L, ProblemStatus.SOLVED, Difficulty.EASY, LocalDate.of(2026, 2, 27));
        Problem masteredWithoutAcceptedAttempt = problem(2L, ProblemStatus.MASTERED, Difficulty.HARD, LocalDate.of(2026, 2, 28));

        Attempt accepted = attempt(Outcome.ACCEPTED, Difficulty.EASY, 1);
        accepted.setProblem(solved);
        accepted.setDurationMinutes(25);
        accepted.setCreatedDate(LocalDateTime.of(2026, 2, 27, 10, 0));

        Attempt failed = attempt(Outcome.WRONG_ANSWER, Difficulty.HARD, 1);
        failed.setProblem(masteredWithoutAcceptedAttempt);
        failed.setDurationMinutes(35);
        failed.setCreatedDate(LocalDateTime.of(2026, 2, 28, 8, 0));

        when(problemRepository.findAllByUser(user)).thenReturn(List.of(solved, masteredWithoutAcceptedAttempt));
        when(attemptRepository.findByUserOrderByCreatedDateAsc(user)).thenReturn(List.of(accepted, failed));

        List<DailyStat> dailyStats = statsService.getDailyStatsBetween(
                user,
                LocalDate.of(2026, 2, 27),
                LocalDate.of(2026, 2, 28));

        assertThat(dailyStats).hasSize(2);
        assertThat(dailyStats.get(0).getDate()).isEqualTo(LocalDate.of(2026, 2, 27));
        assertThat(dailyStats.get(0).getSolved()).isEqualTo(1);
        assertThat(dailyStats.get(0).getAttempted()).isEqualTo(1);
        assertThat(dailyStats.get(0).getTimeMinutes()).isEqualTo(25);

        assertThat(dailyStats.get(1).getDate()).isEqualTo(LocalDate.of(2026, 2, 28));
        assertThat(dailyStats.get(1).getSolved()).isEqualTo(1);
        assertThat(dailyStats.get(1).getAttempted()).isEqualTo(1);
        assertThat(dailyStats.get(1).getTimeMinutes()).isEqualTo(35);
    }

    private UserStats statsWithAttempts(int totalAttempts) {
        UserStats stats = new UserStats();
        stats.setTotalAttempts(totalAttempts);
        return stats;
    }

    private Problem problem(Long id, ProblemStatus status, Difficulty difficulty, LocalDate modifiedDate) {
        Problem problem = new Problem();
        problem.setId(id);
        problem.setStatus(status);
        problem.setDifficulty(difficulty);
        problem.setCreatedDate(modifiedDate.atStartOfDay());
        problem.setLastModifiedDate(modifiedDate.atStartOfDay());
        return problem;
    }

    private Topic topic(Long id) {
        Topic topic = new Topic();
        topic.setId(id);
        return topic;
    }

    private Pattern pattern(Long id) {
        Pattern pattern = new Pattern();
        pattern.setId(id);
        return pattern;
    }

    private Attempt attempt(Outcome outcome, Difficulty difficulty, int attemptNumber) {
        Problem problem = new Problem();
        problem.setDifficulty(difficulty);
        problem.setId((long) attemptNumber);

        Attempt attempt = new Attempt();
        attempt.setProblem(problem);
        attempt.setOutcome(outcome);
        attempt.setAttemptNumber(attemptNumber);
        attempt.setMistakes(List.of());
        return attempt;
    }
}
