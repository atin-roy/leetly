package com.atinroy.leetly.review.service;

import com.atinroy.leetly.review.model.CardState;
import com.atinroy.leetly.review.model.Rating;
import com.atinroy.leetly.review.model.ReviewCard;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * FSRS v5 spaced repetition scheduler.
 * Pure algorithm with no business logic dependencies.
 *
 * Reference: https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm
 */
@Component
public class FsrsScheduler {

    // FSRS v5 default parameters (from Anki defaults)
    private static final double[] W = {
        0.4072, 1.1829, 3.1262, 15.4722,  // w0-w3: initial stability for Again/Hard/Good/Easy
        7.2102,                             // w4: difficulty mean reversion speed
        0.5316,                             // w5: difficulty mean reversion target
        1.0651,                             // w6: stability increase (hard penalty)
        0.0046,                             // w7: stability increase (stability weight)
        1.5418,                             // w8: stability increase (retrievability weight)
        0.6136,                             // w9: stability increase (easy bonus / base)
        1.0730,                             // w10: stability decrease (base)
        0.2009,                             // w11: stability decrease (difficulty weight)
        2.5893,                             // w12: stability decrease (stability weight)
        0.0517,                             // w13: stability decrease (retrievability weight)
        0.3005,                             // w14: stability short-term (base)
        2.1214,                             // w15: stability short-term (rating weight)
        0.2498,                             // w16: stability short-term (state weight)
        2.9466,                             // w17: first difficulty from rating
        0.4891,                             // w18: first difficulty base
    };

    private static final double DECAY = -0.5;
    private static final double FACTOR = Math.pow(0.9, 1.0 / DECAY) - 1.0;

    public record SchedulingResult(
        CardState state,
        double stability,
        double difficulty,
        LocalDateTime due,
        int scheduledDays,
        int elapsedDays,
        int reps,
        int lapses
    ) {}

    public SchedulingResult schedule(ReviewCard card, Rating rating, LocalDateTime now) {
        CardState currentState = card.getState();
        int elapsedDays = computeElapsedDays(card, now);

        return switch (currentState) {
            case NEW -> scheduleNew(card, rating, now);
            case LEARNING, RELEARNING -> scheduleShortTerm(card, rating, now, elapsedDays);
            case REVIEW -> scheduleReview(card, rating, now, elapsedDays);
        };
    }

    private SchedulingResult scheduleNew(ReviewCard card, Rating rating, LocalDateTime now) {
        double initStability = W[rating.value() - 1];
        double initDifficulty = clampDifficulty(W[18] - W[17] * (rating.value() - 3));

        if (rating == Rating.EASY) {
            int interval = Math.max(1, (int) Math.round(initStability));
            return new SchedulingResult(
                CardState.REVIEW,
                initStability,
                initDifficulty,
                now.plusDays(interval),
                interval,
                0,
                card.getReps() + 1,
                card.getLapses()
            );
        }

        long minutes = switch (rating) {
            case AGAIN -> 1;
            case HARD -> 5;
            case GOOD -> 10;
            default -> 10;
        };

        return new SchedulingResult(
            CardState.LEARNING,
            initStability,
            initDifficulty,
            now.plusMinutes(minutes),
            0,
            0,
            card.getReps() + 1,
            card.getLapses()
        );
    }

    private SchedulingResult scheduleShortTerm(ReviewCard card, Rating rating, LocalDateTime now, int elapsedDays) {
        double s = card.getStability();
        double d = card.getDifficulty();

        double newS = s * Math.exp(W[14] * (rating.value() - 3 + W[15]) * Math.pow(s + 1, -W[16]));
        newS = Math.max(0.01, newS);

        double newD = updateDifficulty(d, rating);

        if (rating == Rating.AGAIN || rating == Rating.HARD) {
            long minutes = rating == Rating.AGAIN ? 1 : 5;
            return new SchedulingResult(
                card.getState(),
                newS,
                newD,
                now.plusMinutes(minutes),
                0,
                elapsedDays,
                card.getReps() + 1,
                card.getLapses()
            );
        }

        int interval = Math.max(1, (int) Math.round(newS));
        return new SchedulingResult(
            CardState.REVIEW,
            newS,
            newD,
            now.plusDays(interval),
            interval,
            elapsedDays,
            card.getReps() + 1,
            card.getLapses()
        );
    }

    private SchedulingResult scheduleReview(ReviewCard card, Rating rating, LocalDateTime now, int elapsedDays) {
        double s = card.getStability();
        double d = card.getDifficulty();
        double retrievability = computeRetrievability(elapsedDays, s);

        double newD = updateDifficulty(d, rating);

        if (rating == Rating.AGAIN) {
            double newS = stabilityAfterFailure(d, s, retrievability);
            return new SchedulingResult(
                CardState.RELEARNING,
                newS,
                newD,
                now.plusMinutes(1),
                0,
                elapsedDays,
                card.getReps() + 1,
                card.getLapses() + 1
            );
        }

        double newS = stabilityAfterSuccess(d, s, retrievability, rating);
        int interval = Math.max(1, (int) Math.round(newS));
        if (rating == Rating.EASY) {
            interval = Math.max(interval, card.getScheduledDays() + 1);
        }

        return new SchedulingResult(
            CardState.REVIEW,
            newS,
            newD,
            now.plusDays(interval),
            interval,
            elapsedDays,
            card.getReps() + 1,
            card.getLapses()
        );
    }

    private double stabilityAfterSuccess(double d, double s, double r, Rating rating) {
        double hardPenalty = (rating == Rating.HARD) ? W[6] : 1.0;
        double easyBonus = (rating == Rating.EASY) ? W[9] : 1.0;
        return s * (1.0 + Math.exp(W[7]) *
            (11.0 - d) *
            Math.pow(s, -W[8]) *
            (Math.exp((1.0 - r) * W[9]) - 1.0) *
            hardPenalty *
            easyBonus);
    }

    private double stabilityAfterFailure(double d, double s, double r) {
        return W[10] *
            Math.pow(d, -W[11]) *
            (Math.pow(s + 1.0, W[12]) - 1.0) *
            Math.exp((1.0 - r) * W[13]);
    }

    private double updateDifficulty(double d, Rating rating) {
        double newD = d - W[5] * (rating.value() - 3);
        newD = W[4] * W[18] + (1.0 - W[4]) * newD;
        return clampDifficulty(newD);
    }

    private double computeRetrievability(int elapsedDays, double stability) {
        if (stability <= 0) return 0.0;
        return Math.pow(1.0 + FACTOR * elapsedDays / stability, DECAY);
    }

    private int computeElapsedDays(ReviewCard card, LocalDateTime now) {
        if (card.getLastReview() == null) return 0;
        long days = Duration.between(card.getLastReview(), now).toDays();
        return Math.max(0, (int) days);
    }

    private static double clampDifficulty(double d) {
        return Math.max(0.0, Math.min(1.0, d));
    }
}
