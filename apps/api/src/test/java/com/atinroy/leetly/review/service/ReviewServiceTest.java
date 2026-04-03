package com.atinroy.leetly.review.service;

import com.atinroy.leetly.common.exception.ConflictException;
import com.atinroy.leetly.common.exception.ResourceNotFoundException;
import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.problem.repository.ProblemRepository;
import com.atinroy.leetly.review.model.CardState;
import com.atinroy.leetly.review.model.Rating;
import com.atinroy.leetly.review.model.ReviewCard;
import com.atinroy.leetly.review.repository.ReviewCardRepository;
import com.atinroy.leetly.review.repository.ReviewLogRepository;
import com.atinroy.leetly.user.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    ReviewCardRepository reviewCardRepository;

    @Mock
    ReviewLogRepository reviewLogRepository;

    @Mock
    ProblemRepository problemRepository;

    @Spy
    FsrsScheduler fsrsScheduler = new FsrsScheduler();

    @InjectMocks
    ReviewService reviewService;

    private User testUser() {
        User user = new User();
        user.setId(1L);
        return user;
    }

    private Problem testProblem() {
        Problem p = new Problem();
        p.setId(10L);
        return p;
    }

    @Test
    void enroll_createsNewReviewCard() {
        User user = testUser();
        Problem problem = testProblem();

        when(problemRepository.findByIdAndUser(10L, user)).thenReturn(Optional.of(problem));
        when(reviewCardRepository.existsByProblemAndUser(problem, user)).thenReturn(false);
        when(reviewCardRepository.save(any(ReviewCard.class))).thenAnswer(inv -> {
            ReviewCard card = inv.getArgument(0);
            card.setId(100L);
            return card;
        });

        ReviewCard result = reviewService.enroll(10L, user);

        assertThat(result.getProblem()).isEqualTo(problem);
        assertThat(result.getUser()).isEqualTo(user);
        assertThat(result.getState()).isEqualTo(CardState.NEW);
    }

    @Test
    void enroll_throwsConflict_ifAlreadyEnrolled() {
        User user = testUser();
        Problem problem = testProblem();

        when(problemRepository.findByIdAndUser(10L, user)).thenReturn(Optional.of(problem));
        when(reviewCardRepository.existsByProblemAndUser(problem, user)).thenReturn(true);

        assertThatThrownBy(() -> reviewService.enroll(10L, user))
            .isInstanceOf(ConflictException.class);
    }

    @Test
    void quickReview_updatesCardState() {
        User user = testUser();
        ReviewCard card = new ReviewCard();
        card.setId(100L);
        card.setState(CardState.NEW);
        card.setStability(0.0);
        card.setDifficulty(0.0);
        card.setReps(0);
        card.setLapses(0);
        card.setElapsedDays(0);
        card.setScheduledDays(0);

        when(reviewCardRepository.findByIdAndUser(100L, user)).thenReturn(Optional.of(card));
        when(reviewCardRepository.save(any(ReviewCard.class))).thenAnswer(inv -> inv.getArgument(0));

        ReviewCard result = reviewService.quickReview(100L, Rating.GOOD, user);

        assertThat(result.getState()).isNotEqualTo(CardState.NEW);
        verify(reviewLogRepository).save(any());
    }

    @Test
    void remove_deletesCard() {
        User user = testUser();
        ReviewCard card = new ReviewCard();
        card.setId(100L);

        when(reviewCardRepository.findByIdAndUser(100L, user)).thenReturn(Optional.of(card));

        reviewService.remove(100L, user);

        verify(reviewCardRepository).delete(card);
    }

    @Test
    void remove_throwsNotFound_ifCardMissing() {
        User user = testUser();
        when(reviewCardRepository.findByIdAndUser(999L, user)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.remove(999L, user))
            .isInstanceOf(ResourceNotFoundException.class);
    }
}
