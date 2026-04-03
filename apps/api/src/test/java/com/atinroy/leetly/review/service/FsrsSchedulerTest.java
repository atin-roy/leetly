package com.atinroy.leetly.review.service;

import com.atinroy.leetly.review.model.CardState;
import com.atinroy.leetly.review.model.Rating;
import com.atinroy.leetly.review.model.ReviewCard;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class FsrsSchedulerTest {

    private final FsrsScheduler scheduler = new FsrsScheduler();

    private ReviewCard newCard() {
        ReviewCard card = new ReviewCard();
        card.setState(CardState.NEW);
        card.setStability(0.0);
        card.setDifficulty(0.0);
        card.setReps(0);
        card.setLapses(0);
        card.setElapsedDays(0);
        card.setScheduledDays(0);
        card.setDue(LocalDateTime.of(2026, 1, 1, 0, 0));
        return card;
    }

    @Test
    void newCard_ratedGood_transitionsToLearning() {
        ReviewCard card = newCard();
        LocalDateTime now = LocalDateTime.of(2026, 1, 1, 0, 0);

        FsrsScheduler.SchedulingResult result = scheduler.schedule(card, Rating.GOOD, now);

        assertThat(result.state()).isEqualTo(CardState.LEARNING);
        assertThat(result.stability()).isGreaterThan(0.0);
        assertThat(result.difficulty()).isBetween(0.0, 1.0);
        assertThat(result.due()).isAfter(now);
        assertThat(result.reps()).isEqualTo(1);
    }

    @Test
    void newCard_ratedAgain_transitionsToLearning() {
        ReviewCard card = newCard();
        LocalDateTime now = LocalDateTime.of(2026, 1, 1, 0, 0);

        FsrsScheduler.SchedulingResult result = scheduler.schedule(card, Rating.AGAIN, now);

        assertThat(result.state()).isEqualTo(CardState.LEARNING);
        assertThat(result.due()).isAfter(now);
    }

    @Test
    void newCard_ratedEasy_transitionsToReview() {
        ReviewCard card = newCard();
        LocalDateTime now = LocalDateTime.of(2026, 1, 1, 0, 0);

        FsrsScheduler.SchedulingResult result = scheduler.schedule(card, Rating.EASY, now);

        assertThat(result.state()).isEqualTo(CardState.REVIEW);
        assertThat(result.scheduledDays()).isGreaterThanOrEqualTo(1);
    }

    @Test
    void learningCard_ratedGood_transitionsToReview() {
        ReviewCard card = newCard();
        LocalDateTime now = LocalDateTime.of(2026, 1, 1, 0, 0);

        FsrsScheduler.SchedulingResult first = scheduler.schedule(card, Rating.GOOD, now);
        applyResult(card, first, now);

        LocalDateTime later = first.due().plusMinutes(1);
        FsrsScheduler.SchedulingResult second = scheduler.schedule(card, Rating.GOOD, later);

        assertThat(second.state()).isEqualTo(CardState.REVIEW);
        assertThat(second.scheduledDays()).isGreaterThanOrEqualTo(1);
    }

    @Test
    void reviewCard_ratedAgain_transitionsToRelearning() {
        ReviewCard card = newCard();
        LocalDateTime now = LocalDateTime.of(2026, 1, 1, 0, 0);

        FsrsScheduler.SchedulingResult first = scheduler.schedule(card, Rating.EASY, now);
        applyResult(card, first, now);

        LocalDateTime later = now.plusDays(first.scheduledDays());
        FsrsScheduler.SchedulingResult second = scheduler.schedule(card, Rating.AGAIN, later);

        assertThat(second.state()).isEqualTo(CardState.RELEARNING);
        assertThat(second.lapses()).isEqualTo(1);
    }

    @Test
    void reviewCard_ratedGood_staysInReview_longerInterval() {
        ReviewCard card = newCard();
        LocalDateTime now = LocalDateTime.of(2026, 1, 1, 0, 0);

        FsrsScheduler.SchedulingResult first = scheduler.schedule(card, Rating.EASY, now);
        applyResult(card, first, now);
        int firstInterval = first.scheduledDays();

        LocalDateTime later = now.plusDays(firstInterval);
        FsrsScheduler.SchedulingResult second = scheduler.schedule(card, Rating.GOOD, later);

        assertThat(second.state()).isEqualTo(CardState.REVIEW);
        assertThat(second.scheduledDays()).isGreaterThanOrEqualTo(firstInterval);
    }

    @Test
    void stabilityIncreases_afterSuccessfulReview() {
        ReviewCard card = newCard();
        LocalDateTime now = LocalDateTime.of(2026, 1, 1, 0, 0);

        FsrsScheduler.SchedulingResult first = scheduler.schedule(card, Rating.EASY, now);
        double firstStability = first.stability();
        applyResult(card, first, now);

        LocalDateTime later = now.plusDays(first.scheduledDays());
        FsrsScheduler.SchedulingResult second = scheduler.schedule(card, Rating.GOOD, later);

        assertThat(second.stability()).isGreaterThan(firstStability);
    }

    private void applyResult(ReviewCard card, FsrsScheduler.SchedulingResult result, LocalDateTime reviewedAt) {
        card.setState(result.state());
        card.setStability(result.stability());
        card.setDifficulty(result.difficulty());
        card.setDue(result.due());
        card.setLastReview(reviewedAt);
        card.setReps(result.reps());
        card.setLapses(result.lapses());
        card.setScheduledDays(result.scheduledDays());
        card.setElapsedDays(result.elapsedDays());
    }
}
