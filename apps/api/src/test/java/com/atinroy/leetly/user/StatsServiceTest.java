package com.atinroy.leetly.user;

import com.atinroy.leetly.problem.Attempt;
import com.atinroy.leetly.problem.AttemptRepository;
import com.atinroy.leetly.problem.Difficulty;
import com.atinroy.leetly.problem.LogAttemptRequest;
import com.atinroy.leetly.problem.Outcome;
import com.atinroy.leetly.problem.Problem;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
    DailyStatRepository dailyStatRepository;

    StatsService statsService;

    @BeforeEach
    void setUp() {
        statsService = new StatsService(userStatsRepository, dailyStatRepository, new ObjectMapper());
        // Return empty so upsertDailyStat creates a new record without a save exception
        lenient().when(dailyStatRepository.findByUserAndDate(any(), any())).thenReturn(Optional.empty());
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
        assertThat(stats.getFirstAttemptSolves()).isEqualTo(1); // attemptNumber == 1
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
        // Return only the attempt being deleted — no other accepted attempts remain
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

        // Return both this attempt AND another accepted attempt
        Attempt otherAccepted = attempt(Outcome.ACCEPTED, Difficulty.HARD, 1);
        otherAccepted.setId(99L);
        when(mockAttemptRepo.findByProblemAndUserAndOutcome(any(), any(), any()))
                .thenReturn(List.of(attempt, otherAccepted));

        statsService.adjustOnAttemptDelete(user, attempt, mockAttemptRepo);

        assertThat(stats.getTotalSolved()).isEqualTo(3); // unchanged
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

        assertThat(stats.getTotalTimeMinutes()).isEqualTo(75); // 60 + (45 - 30)
    }

    // --

    private UserStats statsWithAttempts(int totalAttempts) {
        UserStats stats = new UserStats();
        stats.setTotalAttempts(totalAttempts);
        return stats;
    }

    private Attempt attempt(Outcome outcome, Difficulty difficulty, int attemptNumber) {
        Problem problem = new Problem();
        problem.setDifficulty(difficulty);

        Attempt attempt = new Attempt();
        attempt.setProblem(problem);
        attempt.setOutcome(outcome);
        attempt.setAttemptNumber(attemptNumber);
        attempt.setMistakes(List.of());
        return attempt;
    }
}
