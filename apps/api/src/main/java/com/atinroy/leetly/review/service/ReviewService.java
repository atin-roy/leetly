package com.atinroy.leetly.review.service;

import com.atinroy.leetly.common.exception.ConflictException;
import com.atinroy.leetly.common.exception.ResourceNotFoundException;
import com.atinroy.leetly.problem.model.Attempt;
import com.atinroy.leetly.problem.model.Outcome;
import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.problem.repository.ProblemRepository;
import com.atinroy.leetly.review.model.*;
import com.atinroy.leetly.review.repository.ReviewCardRepository;
import com.atinroy.leetly.review.repository.ReviewLogRepository;
import com.atinroy.leetly.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewCardRepository reviewCardRepository;
    private final ReviewLogRepository reviewLogRepository;
    private final ProblemRepository problemRepository;
    private final FsrsScheduler fsrsScheduler;

    public ReviewCard enroll(long problemId, User user) {
        Problem problem = problemRepository.findByIdAndUser(problemId, user)
            .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + problemId));

        if (reviewCardRepository.existsByProblemAndUser(problem, user)) {
            throw new ConflictException("Problem already enrolled for review");
        }

        ReviewCard card = new ReviewCard();
        card.setProblem(problem);
        card.setUser(user);
        return reviewCardRepository.save(card);
    }

    public void remove(long cardId, User user) {
        ReviewCard card = reviewCardRepository.findByIdAndUser(cardId, user)
            .orElseThrow(() -> new ResourceNotFoundException("Review card not found: " + cardId));
        reviewCardRepository.delete(card);
    }

    @Transactional(readOnly = true)
    public Page<ReviewCard> findDueCards(User user, Pageable pageable) {
        return reviewCardRepository.findDueCards(user, LocalDateTime.now(), pageable);
    }

    @Transactional(readOnly = true)
    public ReviewCard findById(long cardId, User user) {
        return reviewCardRepository.findByIdAndUser(cardId, user)
            .orElseThrow(() -> new ResourceNotFoundException("Review card not found: " + cardId));
    }

    @Transactional(readOnly = true)
    public List<ReviewLog> findHistory(long cardId, User user) {
        ReviewCard card = findById(cardId, user);
        return reviewLogRepository.findByReviewCardOrderByReviewedAtDesc(card);
    }

    public ReviewCard quickReview(long cardId, Rating rating, User user) {
        ReviewCard card = reviewCardRepository.findByIdAndUser(cardId, user)
            .orElseThrow(() -> new ResourceNotFoundException("Review card not found: " + cardId));

        return applyReview(card, rating, ReviewType.QUICK_ASSESSMENT, null);
    }

    public void onAttemptLogged(Problem problem, User user, Attempt attempt) {
        reviewCardRepository.findByProblemAndUser(problem, user).ifPresent(card -> {
            Rating rating = mapOutcomeToRating(attempt);
            applyReview(card, rating, ReviewType.FULL_ATTEMPT, attempt);
        });
    }

    public void autoEnrollOnFirstSolve(Problem problem, User user) {
        if (!reviewCardRepository.existsByProblemAndUser(problem, user)) {
            ReviewCard card = new ReviewCard();
            card.setProblem(problem);
            card.setUser(user);
            reviewCardRepository.save(card);
        }
    }

    @Transactional(readOnly = true)
    public long countDue(User user) {
        return reviewCardRepository.countDue(user, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public long countUpcoming7Days(User user) {
        LocalDateTime now = LocalDateTime.now();
        return reviewCardRepository.countUpcoming(user, now, now.plusDays(7));
    }

    @Transactional(readOnly = true)
    public long countTotal(User user) {
        return reviewCardRepository.countByUser(user);
    }

    private ReviewCard applyReview(ReviewCard card, Rating rating, ReviewType type, Attempt attempt) {
        LocalDateTime now = LocalDateTime.now();

        ReviewLog log = new ReviewLog();
        log.setReviewCard(card);
        log.setRating(rating);
        log.setState(card.getState());
        log.setStability(card.getStability());
        log.setDifficulty(card.getDifficulty());
        log.setElapsedDays(card.getElapsedDays());
        log.setScheduledDays(card.getScheduledDays());
        log.setReviewType(type);
        log.setAttempt(attempt);
        log.setReviewedAt(now);
        reviewLogRepository.save(log);

        FsrsScheduler.SchedulingResult result = fsrsScheduler.schedule(card, rating, now);
        card.setState(result.state());
        card.setStability(result.stability());
        card.setDifficulty(result.difficulty());
        card.setDue(result.due());
        card.setLastReview(now);
        card.setReps(result.reps());
        card.setLapses(result.lapses());
        card.setScheduledDays(result.scheduledDays());
        card.setElapsedDays(result.elapsedDays());

        return reviewCardRepository.save(card);
    }

    private Rating mapOutcomeToRating(Attempt attempt) {
        if (attempt.getOutcome() != Outcome.ACCEPTED) {
            return Rating.AGAIN;
        }
        boolean hasMistakes = attempt.getMistakes() != null && !attempt.getMistakes().isEmpty();
        if (hasMistakes) {
            return Rating.HARD;
        }
        Integer duration = attempt.getDurationMinutes();
        if (duration != null && duration <= 10) {
            return Rating.EASY;
        }
        return Rating.GOOD;
    }
}
