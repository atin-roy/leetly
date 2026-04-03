# Spaced Repetition (FSRS) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add FSRS v5 spaced repetition to Leetly so users can schedule and track problem revision with Anki-style scheduling.

**Architecture:** New `review` package in the API with `ReviewCard` and `ReviewLog` entities. Standalone `FsrsScheduler` utility class for pure FSRS math. Frontend gets a new `/review` page, review hooks, and UI additions to the problem detail page and problem table. Auto-enrollment on first solve; manual enrollment/removal from any view.

**Tech Stack:** Spring Boot 4 / Java 25, JPA/Flyway, MapStruct, Next.js 16 / React 19, TanStack Query v5, shadcn/ui, Tailwind v4.

---

## File Structure

### Backend (apps/api/src/main/java/com/atinroy/leetly/)

| File | Action | Purpose |
|------|--------|---------|
| `review/model/CardState.java` | Create | Enum: NEW, LEARNING, REVIEW, RELEARNING |
| `review/model/Rating.java` | Create | Enum: AGAIN(1), HARD(2), GOOD(3), EASY(4) |
| `review/model/ReviewType.java` | Create | Enum: QUICK_ASSESSMENT, FULL_ATTEMPT |
| `review/model/ReviewCard.java` | Create | JPA entity with FSRS state |
| `review/model/ReviewLog.java` | Create | Immutable review history entity |
| `review/repository/ReviewCardRepository.java` | Create | JPA repo with due-date queries |
| `review/repository/ReviewLogRepository.java` | Create | JPA repo for review logs |
| `review/service/FsrsScheduler.java` | Create | Pure FSRS v5 algorithm |
| `review/service/ReviewService.java` | Create | Business logic for reviews |
| `review/controller/ReviewController.java` | Create | REST endpoints |
| `review/dto/ReviewCardDto.java` | Create | Response DTO |
| `review/dto/ReviewLogDto.java` | Create | Response DTO |
| `review/dto/ReviewStatsDto.java` | Create | Stats response DTO |
| `review/dto/EnrollReviewRequest.java` | Create | Request: { problemId } |
| `review/dto/QuickReviewRequest.java` | Create | Request: { rating } |
| `review/mapper/ReviewMapper.java` | Create | MapStruct mapper |
| `problem/service/AttemptService.java` | Modify | Auto-enroll + feed FSRS on attempt |
| `problem/dto/ProblemDetailDto.java` | Modify | Add reviewCard field |
| `problem/dto/ProblemSummaryDto.java` | Modify | Add reviewDue/reviewState fields |
| `problem/service/ProblemService.java` | Modify | Cascade-delete ReviewCard on problem delete |

### Database Migration

| File | Action | Purpose |
|------|--------|---------|
| `src/main/resources/db/migration/V12__review_cards.sql` | Create | DDL for review_cards + review_logs tables |

### Backend Tests

| File | Action | Purpose |
|------|--------|---------|
| `review/service/FsrsSchedulerTest.java` | Create | Unit tests for FSRS algorithm |
| `review/service/ReviewServiceTest.java` | Create | Unit tests for review business logic |

### Frontend (apps/web/)

| File | Action | Purpose |
|------|--------|---------|
| `lib/types.ts` | Modify | Add review-related types |
| `lib/api.ts` | Modify | Add review API functions |
| `hooks/use-reviews.ts` | Create | TanStack Query hooks for reviews |
| `components/review/quick-review-buttons.tsx` | Create | Again/Hard/Good/Easy rating buttons |
| `components/review/review-indicator.tsx` | Create | Icon showing review state (due/overdue/ok) |
| `components/review/review-queue.tsx` | Create | Review queue list for /review page |
| `components/review/review-stats-bar.tsx` | Create | Stats bar for /review page |
| `app/(app)/review/page.tsx` | Create | Review page |
| `components/layout/app-sidebar.tsx` | Modify | Add Review nav item |
| `app/(app)/problems/[id]/page.tsx` | Modify | Add Revision MetaRow |
| `components/problems/problem-table.tsx` | Modify | Add review indicator column + context menu items |
| `app/(app)/dashboard/page.tsx` | Modify | Add "Due for Review" card |
| `components/stats/review-due-card.tsx` | Create | Dashboard review summary card |

---

## Task 1: Database Migration

**Files:**
- Create: `apps/api/src/main/resources/db/migration/V12__review_cards.sql`

- [ ] **Step 1: Write migration SQL**

```sql
-- V12__review_cards.sql

CREATE TABLE review_cards (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    problem_id      BIGINT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    state           VARCHAR(20) NOT NULL DEFAULT 'NEW',
    stability       DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    difficulty      DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    due             TIMESTAMP NOT NULL DEFAULT now(),
    last_review     TIMESTAMP,
    reps            INT NOT NULL DEFAULT 0,
    lapses          INT NOT NULL DEFAULT 0,
    scheduled_days  INT NOT NULL DEFAULT 0,
    elapsed_days    INT NOT NULL DEFAULT 0,
    created_date    TIMESTAMP NOT NULL DEFAULT now(),
    last_modified_date TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_review_card_problem_user UNIQUE (problem_id, user_id)
);

CREATE INDEX idx_review_cards_user_due ON review_cards (user_id, due);
CREATE INDEX idx_review_cards_user_state ON review_cards (user_id, state);

CREATE TABLE review_logs (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    review_card_id  BIGINT NOT NULL REFERENCES review_cards(id) ON DELETE CASCADE,
    rating          VARCHAR(10) NOT NULL,
    state           VARCHAR(20) NOT NULL,
    stability       DOUBLE PRECISION NOT NULL,
    difficulty      DOUBLE PRECISION NOT NULL,
    elapsed_days    INT NOT NULL,
    scheduled_days  INT NOT NULL,
    review_type     VARCHAR(20) NOT NULL,
    attempt_id      BIGINT REFERENCES attempts(id) ON DELETE SET NULL,
    reviewed_at     TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_review_logs_card ON review_logs (review_card_id);
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/main/resources/db/migration/V12__review_cards.sql
git commit -m "feat(review): add V12 migration for review_cards and review_logs tables"
```

---

## Task 2: Review Enums and Entity Models

**Files:**
- Create: `apps/api/src/main/java/com/atinroy/leetly/review/model/CardState.java`
- Create: `apps/api/src/main/java/com/atinroy/leetly/review/model/Rating.java`
- Create: `apps/api/src/main/java/com/atinroy/leetly/review/model/ReviewType.java`
- Create: `apps/api/src/main/java/com/atinroy/leetly/review/model/ReviewCard.java`
- Create: `apps/api/src/main/java/com/atinroy/leetly/review/model/ReviewLog.java`

- [ ] **Step 1: Create CardState enum**

```java
package com.atinroy.leetly.review.model;

public enum CardState {
    NEW,
    LEARNING,
    REVIEW,
    RELEARNING
}
```

- [ ] **Step 2: Create Rating enum**

```java
package com.atinroy.leetly.review.model;

public enum Rating {
    AGAIN(1),
    HARD(2),
    GOOD(3),
    EASY(4);

    private final int value;

    Rating(int value) {
        this.value = value;
    }

    public int value() {
        return value;
    }
}
```

- [ ] **Step 3: Create ReviewType enum**

```java
package com.atinroy.leetly.review.model;

public enum ReviewType {
    QUICK_ASSESSMENT,
    FULL_ATTEMPT
}
```

- [ ] **Step 4: Create ReviewCard entity**

```java
package com.atinroy.leetly.review.model;

import com.atinroy.leetly.common.model.BaseEntity;
import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "review_cards", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"problem_id", "user_id"})
})
public class ReviewCard extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardState state = CardState.NEW;

    @Column(nullable = false)
    private double stability = 0.0;

    @Column(nullable = false)
    private double difficulty = 0.0;

    @Column(nullable = false)
    private LocalDateTime due = LocalDateTime.now();

    @Column(name = "last_review")
    private LocalDateTime lastReview;

    @Column(nullable = false)
    private int reps = 0;

    @Column(nullable = false)
    private int lapses = 0;

    @Column(name = "scheduled_days", nullable = false)
    private int scheduledDays = 0;

    @Column(name = "elapsed_days", nullable = false)
    private int elapsedDays = 0;
}
```

- [ ] **Step 5: Create ReviewLog entity**

```java
package com.atinroy.leetly.review.model;

import com.atinroy.leetly.problem.model.Attempt;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "review_logs")
public class ReviewLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "review_card_id", nullable = false)
    private ReviewCard reviewCard;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rating rating;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardState state;

    @Column(nullable = false)
    private double stability;

    @Column(nullable = false)
    private double difficulty;

    @Column(name = "elapsed_days", nullable = false)
    private int elapsedDays;

    @Column(name = "scheduled_days", nullable = false)
    private int scheduledDays;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_type", nullable = false)
    private ReviewType reviewType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id")
    private Attempt attempt;

    @Column(name = "reviewed_at", nullable = false)
    private LocalDateTime reviewedAt = LocalDateTime.now();
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/main/java/com/atinroy/leetly/review/model/
git commit -m "feat(review): add ReviewCard, ReviewLog entities and supporting enums"
```

---

## Task 3: FSRS v5 Scheduler

**Files:**
- Create: `apps/api/src/main/java/com/atinroy/leetly/review/service/FsrsScheduler.java`
- Create: `apps/api/src/test/java/com/atinroy/leetly/review/service/FsrsSchedulerTest.java`

- [ ] **Step 1: Write FsrsScheduler tests**

```java
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

        // Easy on a new card should skip learning and go to review
        assertThat(result.state()).isEqualTo(CardState.REVIEW);
        assertThat(result.scheduledDays()).isGreaterThanOrEqualTo(1);
    }

    @Test
    void learningCard_ratedGood_transitionsToReview() {
        ReviewCard card = newCard();
        LocalDateTime now = LocalDateTime.of(2026, 1, 1, 0, 0);

        // First: rate Good to enter Learning
        FsrsScheduler.SchedulingResult first = scheduler.schedule(card, Rating.GOOD, now);
        applyResult(card, first);

        // Second: rate Good again to graduate to Review
        LocalDateTime later = first.due().plusMinutes(1);
        FsrsScheduler.SchedulingResult second = scheduler.schedule(card, Rating.GOOD, later);

        assertThat(second.state()).isEqualTo(CardState.REVIEW);
        assertThat(second.scheduledDays()).isGreaterThanOrEqualTo(1);
    }

    @Test
    void reviewCard_ratedAgain_transitionsToRelearning() {
        ReviewCard card = newCard();
        LocalDateTime now = LocalDateTime.of(2026, 1, 1, 0, 0);

        // Graduate card to REVIEW state via Easy
        FsrsScheduler.SchedulingResult first = scheduler.schedule(card, Rating.EASY, now);
        applyResult(card, first);

        // Rate Again in Review -> Relearning
        LocalDateTime later = now.plusDays(first.scheduledDays());
        FsrsScheduler.SchedulingResult second = scheduler.schedule(card, Rating.AGAIN, later);

        assertThat(second.state()).isEqualTo(CardState.RELEARNING);
        assertThat(second.lapses()).isEqualTo(1);
    }

    @Test
    void reviewCard_ratedGood_staysInReview_longerInterval() {
        ReviewCard card = newCard();
        LocalDateTime now = LocalDateTime.of(2026, 1, 1, 0, 0);

        // Graduate to Review
        FsrsScheduler.SchedulingResult first = scheduler.schedule(card, Rating.EASY, now);
        applyResult(card, first);
        int firstInterval = first.scheduledDays();

        // Review again with Good
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
        applyResult(card, first);

        LocalDateTime later = now.plusDays(first.scheduledDays());
        FsrsScheduler.SchedulingResult second = scheduler.schedule(card, Rating.GOOD, later);

        assertThat(second.stability()).isGreaterThan(firstStability);
    }

    private void applyResult(ReviewCard card, FsrsScheduler.SchedulingResult result) {
        card.setState(result.state());
        card.setStability(result.stability());
        card.setDifficulty(result.difficulty());
        card.setDue(result.due());
        card.setLastReview(result.due().minusSeconds(1)); // approximate
        card.setReps(result.reps());
        card.setLapses(result.lapses());
        card.setScheduledDays(result.scheduledDays());
        card.setElapsedDays(result.elapsedDays());
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/api && ./mvnw test -pl . -Dtest=FsrsSchedulerTest -Dsurefire.failIfNoSpecifiedTests=false
```

Expected: compilation error — `FsrsScheduler` class does not exist yet.

- [ ] **Step 3: Implement FsrsScheduler**

```java
package com.atinroy.leetly.review.service;

import com.atinroy.leetly.review.model.CardState;
import com.atinroy.leetly.review.model.Rating;
import com.atinroy.leetly.review.model.ReviewCard;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * FSRS v5 spaced repetition scheduler.
 * Pure algorithm — no Spring dependencies.
 *
 * Reference: https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm
 */
public class FsrsScheduler {

    // FSRS v5 default parameters (from Anki defaults)
    private static final double[] W = {
        0.4072, 1.1829, 3.1262, 15.4722,  // w0-w3: initial stability for Again/Hard/Good/Easy
        7.2102,                             // w4: difficulty mean reversion speed
        0.5316,                             // w5: difficulty mean reversion target
        1.0651,                             // w6: stability increase (difficulty weight)
        0.0046,                             // w7: stability increase (stability weight)
        1.5418,                             // w8: stability increase (retrievability weight)
        0.6136,                             // w9: stability increase (base)
        1.0730,                             // w10: stability decrease (difficulty weight)
        0.2009,                             // w11: stability decrease (stability weight)
        2.5893,                             // w12: difficulty update (rating weight)
        0.0517,                             // w13: difficulty update (mean reversion weight)
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
        double initStability = W[rating.value() - 1]; // w0..w3
        double initDifficulty = clampDifficulty(W[18] - W[17] * (rating.value() - 3));

        if (rating == Rating.EASY) {
            // Skip learning, go directly to Review
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

        // Enter Learning with short-term scheduling
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

        // Update stability using short-term formula
        double newS = s * Math.exp(W[14] * (rating.value() - 3 + W[15]) * Math.pow(s + 1, -W[16]));
        newS = Math.max(0.01, newS);

        double newD = updateDifficulty(d, rating);

        if (rating == Rating.AGAIN || rating == Rating.HARD) {
            // Stay in current short-term state
            long minutes = rating == Rating.AGAIN ? 1 : 5;
            return new SchedulingResult(
                card.getState(), // keep LEARNING or RELEARNING
                newS,
                newD,
                now.plusMinutes(minutes),
                0,
                elapsedDays,
                card.getReps() + 1,
                card.getLapses()
            );
        }

        // Graduate to Review
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
            // Lapse: go to Relearning
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

        // Success: stay in Review with longer interval
        double newS = stabilityAfterSuccess(d, s, retrievability, rating);
        int interval = Math.max(1, (int) Math.round(newS));
        // Ensure interval is at least current + 1 for Good/Easy
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
        // Mean reversion
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/api && ./mvnw test -pl . -Dtest=FsrsSchedulerTest
```

Expected: all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/main/java/com/atinroy/leetly/review/service/FsrsScheduler.java \
       apps/api/src/test/java/com/atinroy/leetly/review/service/FsrsSchedulerTest.java
git commit -m "feat(review): implement FSRS v5 scheduler with tests"
```

---

## Task 4: Review Repositories

**Files:**
- Create: `apps/api/src/main/java/com/atinroy/leetly/review/repository/ReviewCardRepository.java`
- Create: `apps/api/src/main/java/com/atinroy/leetly/review/repository/ReviewLogRepository.java`

- [ ] **Step 1: Create ReviewCardRepository**

```java
package com.atinroy.leetly.review.repository;

import com.atinroy.leetly.review.model.ReviewCard;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.problem.model.Problem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ReviewCardRepository extends JpaRepository<ReviewCard, Long> {

    Optional<ReviewCard> findByProblemAndUser(Problem problem, User user);

    Optional<ReviewCard> findByIdAndUser(Long id, User user);

    @Query("SELECT rc FROM ReviewCard rc WHERE rc.user = :user AND rc.due <= :now ORDER BY rc.due ASC")
    Page<ReviewCard> findDueCards(@Param("user") User user, @Param("now") LocalDateTime now, Pageable pageable);

    @Query("SELECT COUNT(rc) FROM ReviewCard rc WHERE rc.user = :user AND rc.due <= :now")
    long countDue(@Param("user") User user, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(rc) FROM ReviewCard rc WHERE rc.user = :user AND rc.due > :now AND rc.due <= :until")
    long countUpcoming(@Param("user") User user, @Param("now") LocalDateTime now, @Param("until") LocalDateTime until);

    long countByUser(User user);

    void deleteByProblemAndUser(Problem problem, User user);

    boolean existsByProblemAndUser(Problem problem, User user);
}
```

- [ ] **Step 2: Create ReviewLogRepository**

```java
package com.atinroy.leetly.review.repository;

import com.atinroy.leetly.review.model.ReviewCard;
import com.atinroy.leetly.review.model.ReviewLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewLogRepository extends JpaRepository<ReviewLog, Long> {

    List<ReviewLog> findByReviewCardOrderByReviewedAtDesc(ReviewCard reviewCard);
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/main/java/com/atinroy/leetly/review/repository/
git commit -m "feat(review): add ReviewCard and ReviewLog repositories"
```

---

## Task 5: Review DTOs and Mapper

**Files:**
- Create: `apps/api/src/main/java/com/atinroy/leetly/review/dto/ReviewCardDto.java`
- Create: `apps/api/src/main/java/com/atinroy/leetly/review/dto/ReviewLogDto.java`
- Create: `apps/api/src/main/java/com/atinroy/leetly/review/dto/ReviewStatsDto.java`
- Create: `apps/api/src/main/java/com/atinroy/leetly/review/dto/EnrollReviewRequest.java`
- Create: `apps/api/src/main/java/com/atinroy/leetly/review/dto/QuickReviewRequest.java`
- Create: `apps/api/src/main/java/com/atinroy/leetly/review/mapper/ReviewMapper.java`

- [ ] **Step 1: Create DTOs**

```java
// ReviewCardDto.java
package com.atinroy.leetly.review.dto;

import com.atinroy.leetly.review.model.CardState;
import java.time.LocalDateTime;

public record ReviewCardDto(
    Long id,
    Long problemId,
    long leetcodeId,
    String problemTitle,
    String problemUrl,
    String difficulty,
    String problemStatus,
    CardState state,
    double stability,
    double fsrsDifficulty,
    LocalDateTime due,
    LocalDateTime lastReview,
    int reps,
    int lapses,
    int scheduledDays,
    int elapsedDays
) {}
```

```java
// ReviewLogDto.java
package com.atinroy.leetly.review.dto;

import com.atinroy.leetly.review.model.CardState;
import com.atinroy.leetly.review.model.Rating;
import com.atinroy.leetly.review.model.ReviewType;
import java.time.LocalDateTime;

public record ReviewLogDto(
    Long id,
    Rating rating,
    CardState state,
    double stability,
    double difficulty,
    int elapsedDays,
    int scheduledDays,
    ReviewType reviewType,
    Long attemptId,
    LocalDateTime reviewedAt
) {}
```

```java
// ReviewStatsDto.java
package com.atinroy.leetly.review.dto;

public record ReviewStatsDto(
    long dueNow,
    long upcoming7Days,
    long totalEnrolled
) {}
```

```java
// EnrollReviewRequest.java
package com.atinroy.leetly.review.dto;

import jakarta.validation.constraints.NotNull;

public record EnrollReviewRequest(
    @NotNull Long problemId
) {}
```

```java
// QuickReviewRequest.java
package com.atinroy.leetly.review.dto;

import com.atinroy.leetly.review.model.Rating;
import jakarta.validation.constraints.NotNull;

public record QuickReviewRequest(
    @NotNull Rating rating
) {}
```

- [ ] **Step 2: Create ReviewMapper**

```java
package com.atinroy.leetly.review.mapper;

import com.atinroy.leetly.review.dto.ReviewCardDto;
import com.atinroy.leetly.review.dto.ReviewLogDto;
import com.atinroy.leetly.review.model.ReviewCard;
import com.atinroy.leetly.review.model.ReviewLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "problemId", source = "problem.id")
    @Mapping(target = "leetcodeId", source = "problem.leetcodeId")
    @Mapping(target = "problemTitle", source = "problem.title")
    @Mapping(target = "problemUrl", source = "problem.url")
    @Mapping(target = "difficulty", source = "problem.difficulty")
    @Mapping(target = "problemStatus", source = "problem.status")
    @Mapping(target = "fsrsDifficulty", source = "difficulty")
    ReviewCardDto toDto(ReviewCard card);

    @Mapping(target = "attemptId", source = "attempt.id")
    ReviewLogDto toLogDto(ReviewLog log);
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/main/java/com/atinroy/leetly/review/dto/ \
       apps/api/src/main/java/com/atinroy/leetly/review/mapper/
git commit -m "feat(review): add review DTOs and MapStruct mapper"
```

---

## Task 6: ReviewService

**Files:**
- Create: `apps/api/src/main/java/com/atinroy/leetly/review/service/ReviewService.java`
- Create: `apps/api/src/test/java/com/atinroy/leetly/review/service/ReviewServiceTest.java`

- [ ] **Step 1: Write ReviewService tests**

```java
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
import org.mockito.ArgumentCaptor;
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/api && ./mvnw test -pl . -Dtest=ReviewServiceTest -Dsurefire.failIfNoSpecifiedTests=false
```

Expected: compilation error — `ReviewService` does not exist.

- [ ] **Step 3: Implement ReviewService**

```java
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

    /**
     * Called by AttemptService when an attempt is logged on a problem that has a ReviewCard.
     */
    public void onAttemptLogged(Problem problem, User user, Attempt attempt) {
        reviewCardRepository.findByProblemAndUser(problem, user).ifPresent(card -> {
            Rating rating = mapOutcomeToRating(attempt);
            applyReview(card, rating, ReviewType.FULL_ATTEMPT, attempt);
        });
    }

    /**
     * Called by AttemptService to auto-create a ReviewCard when a problem is first solved.
     */
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

        // Snapshot state before review for the log
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

        // Apply FSRS scheduling
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
```

- [ ] **Step 4: Create FsrsScheduler Spring bean**

The `FsrsScheduler` is a plain class. Register it as a bean so `ReviewService` can inject it. Add a `@Component` annotation to `FsrsScheduler`:

Add `@org.springframework.stereotype.Component` to `FsrsScheduler` class declaration.

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd apps/api && ./mvnw test -pl . -Dtest=ReviewServiceTest
```

Expected: all 5 tests pass.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/main/java/com/atinroy/leetly/review/service/ReviewService.java \
       apps/api/src/main/java/com/atinroy/leetly/review/service/FsrsScheduler.java \
       apps/api/src/test/java/com/atinroy/leetly/review/service/ReviewServiceTest.java
git commit -m "feat(review): implement ReviewService with FSRS integration and tests"
```

---

## Task 7: ReviewController

**Files:**
- Create: `apps/api/src/main/java/com/atinroy/leetly/review/controller/ReviewController.java`

- [ ] **Step 1: Create ReviewController**

```java
package com.atinroy.leetly.review.controller;

import com.atinroy.leetly.review.dto.*;
import com.atinroy.leetly.review.mapper.ReviewMapper;
import com.atinroy.leetly.review.service.ReviewService;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review-cards")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewMapper reviewMapper;
    private final UserService userService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewCardDto enroll(@Valid @RequestBody EnrollReviewRequest request,
                                @AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return reviewMapper.toDto(reviewService.enroll(request.problemId(), user));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable long id,
                       @AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        reviewService.remove(id, user);
    }

    @GetMapping("/due")
    public Page<ReviewCardDto> findDue(Pageable pageable,
                                       @AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return reviewService.findDueCards(user, pageable).map(reviewMapper::toDto);
    }

    @GetMapping("/stats")
    public ReviewStatsDto stats(@AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return new ReviewStatsDto(
            reviewService.countDue(user),
            reviewService.countUpcoming7Days(user),
            reviewService.countTotal(user)
        );
    }

    @PostMapping("/{id}/review")
    public ReviewCardDto quickReview(@PathVariable long id,
                                     @Valid @RequestBody QuickReviewRequest request,
                                     @AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return reviewMapper.toDto(reviewService.quickReview(id, request.rating(), user));
    }

    @GetMapping("/{id}/history")
    public List<ReviewLogDto> history(@PathVariable long id,
                                      @AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreate(jwt.getSubject());
        return reviewService.findHistory(id, user).stream().map(reviewMapper::toLogDto).toList();
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/main/java/com/atinroy/leetly/review/controller/ReviewController.java
git commit -m "feat(review): add ReviewController REST endpoints"
```

---

## Task 8: Integrate with AttemptService

**Files:**
- Modify: `apps/api/src/main/java/com/atinroy/leetly/problem/service/AttemptService.java`

- [ ] **Step 1: Add ReviewService dependency and integration to AttemptService**

In `AttemptService.java`, add `ReviewService` as a constructor dependency (it will be injected via `@RequiredArgsConstructor`):

Add field:
```java
private final ReviewService reviewService;
```

Import:
```java
import com.atinroy.leetly.review.service.ReviewService;
```

In the `logAttempt` method, after the line `statsService.updateOnAttempt(user, savedAttempt, isFirstSolve);`, add:

```java
// Auto-enroll in spaced repetition on first solve
if (isFirstSolve) {
    reviewService.autoEnrollOnFirstSolve(problem, user);
}

// Feed attempt into FSRS if card exists
reviewService.onAttemptLogged(problem, user, savedAttempt);
```

- [ ] **Step 2: Run all existing tests to verify nothing broke**

```bash
cd apps/api && ./mvnw test -pl .
```

Expected: all tests pass (existing tests mock dependencies, so adding a new field may require updating test setup for `AttemptService` tests if any exist that use `@InjectMocks`).

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/main/java/com/atinroy/leetly/problem/service/AttemptService.java
git commit -m "feat(review): integrate FSRS auto-enrollment and attempt feedback into AttemptService"
```

---

## Task 9: Update ProblemDetailDto to Include ReviewCard

**Files:**
- Modify: `apps/api/src/main/java/com/atinroy/leetly/problem/dto/ProblemDetailDto.java`
- Modify: `apps/api/src/main/java/com/atinroy/leetly/problem/service/ProblemService.java`
- Modify: `apps/api/src/main/java/com/atinroy/leetly/problem/controller/ProblemController.java`

- [ ] **Step 1: Add ReviewCardSummary to ProblemDetailDto**

Add a new inner record and field to `ProblemDetailDto`:

```java
// Add at the end of ProblemDetailDto's fields:
ReviewCardSummary reviewCard

// Add inner record:
public record ReviewCardSummary(
    Long id,
    String state,
    LocalDateTime due,
    int reps,
    int lapses,
    double stability
) {}
```

Update the `from()` static method to accept an optional `ReviewCard`:

```java
public static ProblemDetailDto from(Problem problem, ReviewCard reviewCard) {
    ReviewCardSummary summary = reviewCard != null
        ? new ReviewCardSummary(
            reviewCard.getId(),
            reviewCard.getState().name(),
            reviewCard.getDue(),
            reviewCard.getReps(),
            reviewCard.getLapses(),
            reviewCard.getStability()
        )
        : null;

    return new ProblemDetailDto(
        problem.getId(),
        problem.getLeetcodeId(),
        problem.getTitle(),
        problem.getUrl(),
        problem.getDifficulty(),
        problem.getStatus(),
        problem.getLastAttemptedAt(),
        problem.getAiReview(),
        problem.getTopics().stream().map(TopicDto::from).toList(),
        problem.getPatterns().stream().map(PatternDto::from).toList(),
        problem.getRelatedProblems().stream().map(ProblemSummaryDto::from).toList(),
        problem.getAttempts().stream().map(AttemptDto::from).toList(),
        summary
    );
}
```

- [ ] **Step 2: Update ProblemService.findDetailById**

Inject `ReviewCardRepository` into `ProblemService` and update `findDetailById` to return the review card:

```java
// Add field:
private final ReviewCardRepository reviewCardRepository;

// Add import:
import com.atinroy.leetly.review.repository.ReviewCardRepository;

// Update method to return a Pair or change return approach.
// Since ProblemDetailDto.from() now needs a ReviewCard, we handle it in the controller instead.
```

Actually, it's cleaner to handle this in the controller since `ProblemDetailDto.from()` is called there. Add `ReviewCardRepository` to `ProblemController` instead:

In `ProblemController`, inject `ReviewCardRepository` and modify the detail endpoint:

```java
// Add field:
private final ReviewCardRepository reviewCardRepository;

// In the findById endpoint, after getting the problem:
ReviewCard reviewCard = reviewCardRepository.findByProblemAndUser(problem, user).orElse(null);
return ProblemDetailDto.from(problem, reviewCard);
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/main/java/com/atinroy/leetly/problem/dto/ProblemDetailDto.java \
       apps/api/src/main/java/com/atinroy/leetly/problem/controller/ProblemController.java
git commit -m "feat(review): include ReviewCard summary in ProblemDetailDto"
```

---

## Task 10: Frontend Types and API Functions

**Files:**
- Modify: `apps/web/lib/types.ts`
- Modify: `apps/web/lib/api.ts`

- [ ] **Step 1: Add review types to types.ts**

Append to `lib/types.ts`:

```typescript
// ─── Review Domain ───────────────────────────────────────────────────────────

export type CardState = "NEW" | "LEARNING" | "REVIEW" | "RELEARNING"

export type Rating = "AGAIN" | "HARD" | "GOOD" | "EASY"

export type ReviewType = "QUICK_ASSESSMENT" | "FULL_ATTEMPT"

export interface ReviewCardDto {
  id: number
  problemId: number
  leetcodeId: number
  problemTitle: string
  problemUrl: string
  difficulty: Difficulty
  problemStatus: ProblemStatus
  state: CardState
  stability: number
  fsrsDifficulty: number
  due: string // ISO datetime
  lastReview: string | null
  reps: number
  lapses: number
  scheduledDays: number
  elapsedDays: number
}

export interface ReviewCardSummary {
  id: number
  state: string
  due: string // ISO datetime
  reps: number
  lapses: number
  stability: number
}

export interface ReviewLogDto {
  id: number
  rating: Rating
  state: CardState
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  reviewType: ReviewType
  attemptId: number | null
  reviewedAt: string // ISO datetime
}

export interface ReviewStatsDto {
  dueNow: number
  upcoming7Days: number
  totalEnrolled: number
}

export interface EnrollReviewRequest {
  problemId: number
}

export interface QuickReviewRequest {
  rating: Rating
}
```

Also update `ProblemDetailDto` to include `reviewCard`:

```typescript
// Update ProblemDetailDto to add:
reviewCard: ReviewCardSummary | null
```

- [ ] **Step 2: Add review API functions to api.ts**

Append to `lib/api.ts`:

```typescript
// ─── Reviews ─────────────────────────────────────────────────────────────────

export function getReviewCardsDue(
  token: string | undefined,
  page?: number,
  size?: number,
): Promise<PagedResponse<ReviewCardDto>> {
  const params = new URLSearchParams()
  if (page != null) params.set("page", String(page))
  if (size != null) params.set("size", String(size))
  const qs = params.toString()
  return apiFetch(`/api/review-cards/due${qs ? `?${qs}` : ""}`, token)
}

export function getReviewStats(
  token: string | undefined,
): Promise<ReviewStatsDto> {
  return apiFetch("/api/review-cards/stats", token)
}

export function enrollReview(
  token: string | undefined,
  body: EnrollReviewRequest,
): Promise<ReviewCardDto> {
  return apiFetch("/api/review-cards", token, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function removeReview(
  token: string | undefined,
  id: number,
): Promise<void> {
  return apiFetch(`/api/review-cards/${id}`, token, { method: "DELETE" })
}

export function quickReview(
  token: string | undefined,
  cardId: number,
  body: QuickReviewRequest,
): Promise<ReviewCardDto> {
  return apiFetch(`/api/review-cards/${cardId}/review`, token, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function getReviewHistory(
  token: string | undefined,
  cardId: number,
): Promise<ReviewLogDto[]> {
  return apiFetch(`/api/review-cards/${cardId}/history`, token)
}
```

Add the missing imports to the import block at the top of `api.ts`:

```typescript
import type {
  // ... existing imports ...
  EnrollReviewRequest,
  QuickReviewRequest,
  ReviewCardDto,
  ReviewLogDto,
  ReviewStatsDto,
} from "./types"
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/types.ts apps/web/lib/api.ts
git commit -m "feat(review): add frontend review types and API functions"
```

---

## Task 11: Frontend Review Hooks

**Files:**
- Create: `apps/web/hooks/use-reviews.ts`

- [ ] **Step 1: Create use-reviews.ts**

```typescript
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import {
  enrollReview,
  getReviewCardsDue,
  getReviewHistory,
  getReviewStats,
  quickReview,
  removeReview,
} from "@/lib/api"
import type { Rating } from "@/lib/types"

export function useReviewCardsDue(page = 0, size = 20) {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["review-cards", "due", page, size],
    queryFn: () => getReviewCardsDue(session?.accessToken, page, size),
    enabled: !!session?.accessToken,
  })
}

export function useReviewStats() {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["review-cards", "stats"],
    queryFn: () => getReviewStats(session?.accessToken),
    enabled: !!session?.accessToken,
  })
}

export function useReviewHistory(cardId: number) {
  const { data: session } = useSession()
  return useQuery({
    queryKey: ["review-cards", cardId, "history"],
    queryFn: () => getReviewHistory(session?.accessToken, cardId),
    enabled: !!session?.accessToken && !!cardId,
  })
}

export function useEnrollReview() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (problemId: number) =>
      enrollReview(session?.accessToken, { problemId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-cards"] })
      qc.invalidateQueries({ queryKey: ["problems"] })
    },
  })
}

export function useRemoveReview() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (cardId: number) =>
      removeReview(session?.accessToken, cardId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-cards"] })
      qc.invalidateQueries({ queryKey: ["problems"] })
    },
  })
}

export function useQuickReview() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ cardId, rating }: { cardId: number; rating: Rating }) =>
      quickReview(session?.accessToken, cardId, { rating }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-cards"] })
      qc.invalidateQueries({ queryKey: ["problems"] })
    },
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/hooks/use-reviews.ts
git commit -m "feat(review): add TanStack Query hooks for review operations"
```

---

## Task 12: QuickReviewButtons Component

**Files:**
- Create: `apps/web/components/review/quick-review-buttons.tsx`

- [ ] **Step 1: Create QuickReviewButtons**

```tsx
"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useQuickReview } from "@/hooks/use-reviews"
import type { Rating } from "@/lib/types"

const RATINGS: { value: Rating; label: string; className: string }[] = [
  { value: "AGAIN", label: "Again", className: "text-red-600 hover:bg-red-50 border-red-200" },
  { value: "HARD", label: "Hard", className: "text-orange-600 hover:bg-orange-50 border-orange-200" },
  { value: "GOOD", label: "Good", className: "text-blue-600 hover:bg-blue-50 border-blue-200" },
  { value: "EASY", label: "Easy", className: "text-green-600 hover:bg-green-50 border-green-200" },
]

interface Props {
  cardId: number
  size?: "sm" | "default"
}

export function QuickReviewButtons({ cardId, size = "sm" }: Props) {
  const reviewMutation = useQuickReview()

  async function handleReview(rating: Rating) {
    try {
      await reviewMutation.mutateAsync({ cardId, rating })
      toast.success(`Reviewed: ${rating.toLowerCase()}`)
    } catch {
      toast.error("Failed to submit review")
    }
  }

  return (
    <div className="flex gap-1">
      {RATINGS.map(({ value, label, className }) => (
        <Button
          key={value}
          variant="outline"
          size={size}
          disabled={reviewMutation.isPending}
          onClick={() => handleReview(value)}
          className={className}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/review/quick-review-buttons.tsx
git commit -m "feat(review): add QuickReviewButtons component"
```

---

## Task 13: ReviewIndicator Component

**Files:**
- Create: `apps/web/components/review/review-indicator.tsx`

- [ ] **Step 1: Create ReviewIndicator**

```tsx
import { Clock, Check, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { ReviewCardSummary } from "@/lib/types"

interface Props {
  reviewCard: ReviewCardSummary | null
}

export function ReviewIndicator({ reviewCard }: Props) {
  if (!reviewCard) return null

  const now = new Date()
  const due = new Date(reviewCard.due)
  const isOverdue = due < now
  const isDueToday = !isOverdue && due.toDateString() === now.toDateString()

  let icon: React.ReactNode
  let tooltip: string
  let colorClass: string

  if (isOverdue) {
    icon = <AlertCircle className="h-4 w-4" />
    tooltip = "Overdue for review"
    colorClass = "text-red-500"
  } else if (isDueToday) {
    icon = <Clock className="h-4 w-4" />
    tooltip = "Due for review today"
    colorClass = "text-orange-500"
  } else {
    icon = <Check className="h-4 w-4" />
    tooltip = `Next review: ${due.toLocaleDateString()}`
    colorClass = "text-green-500"
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex ${colorClass}`}>{icon}</span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/review/review-indicator.tsx
git commit -m "feat(review): add ReviewIndicator component"
```

---

## Task 14: Problem Detail Page — Revision MetaRow

**Files:**
- Modify: `apps/web/app/(app)/problems/[id]/page.tsx`

- [ ] **Step 1: Add Revision MetaRow to the problem detail page**

In the problem detail page, after the existing metadata rows (Status, Difficulty, LeetCode, Topics, Patterns, Related, Lists), add a "Revision" MetaRow.

Import the new hooks and components:

```typescript
import { useEnrollReview, useRemoveReview } from "@/hooks/use-reviews"
import { QuickReviewButtons } from "@/components/review/quick-review-buttons"
```

Add the Revision MetaRow inside the metadata section, after the Lists row:

```tsx
<MetaRow label="Revision" align="center">
  {problem.reviewCard ? (
    <div className="flex items-center gap-3">
      <Badge variant="outline" className="text-xs">
        {problem.reviewCard.state}
      </Badge>
      <span className="text-xs text-muted-foreground">
        {new Date(problem.reviewCard.due) < new Date()
          ? `Overdue by ${Math.ceil((Date.now() - new Date(problem.reviewCard.due).getTime()) / 86400000)}d`
          : `Due ${formatRelativeDate(new Date(problem.reviewCard.due))}`}
      </span>
      <span className="text-xs text-muted-foreground">
        {problem.reviewCard.reps} reviews
      </span>
      {(new Date(problem.reviewCard.due) <= new Date()) && (
        <QuickReviewButtons cardId={problem.reviewCard.id} />
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-1 text-muted-foreground hover:text-destructive"
        onClick={() => removeReview.mutate(problem.reviewCard!.id)}
        disabled={removeReview.isPending}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  ) : (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 text-xs"
      onClick={() => enrollReview.mutate(problem.id)}
      disabled={enrollReview.isPending}
    >
      <Plus className="mr-1 h-3.5 w-3.5" />
      Add to Review
    </Button>
  )}
</MetaRow>
```

Add a helper function (alongside existing helpers):

```typescript
function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / 86400000)
  if (diffDays === 0) return "today"
  if (diffDays === 1) return "tomorrow"
  return `in ${diffDays} days`
}
```

Wire up the hooks inside the component:

```typescript
const enrollReview = useEnrollReview()
const removeReview = useRemoveReview()
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/\(app\)/problems/\[id\]/page.tsx
git commit -m "feat(review): add Revision metadata row to problem detail page"
```

---

## Task 15: Problem Table — Review Context Menu Items

**Files:**
- Modify: `apps/web/components/problems/problem-table.tsx`

- [ ] **Step 1: Add review context menu items to ProblemTable**

This is a lighter-touch integration for the table. Add "Mark for Revision" / "Remove from Revision" to the context menu.

Add to Props interface:

```typescript
onEnrollReview?: (problem: ProblemSummaryDto) => void
onRemoveReview?: (problemId: number, cardId: number) => void
reviewCardMap?: Map<number, { id: number; due: string; state: string }>
```

In the context menu, after the "Add note" item and before the destructive "Remove problem" item, add:

```tsx
<ContextMenuSeparator />
{reviewCardMap?.has(p.id) ? (
  <ContextMenuItem onClick={() => onRemoveReview?.(p.id, reviewCardMap.get(p.id)!.id)}>
    <X />
    Remove from Revision
  </ContextMenuItem>
) : (
  <ContextMenuItem onClick={() => onEnrollReview?.(p)}>
    <Clock />
    Mark for Revision
  </ContextMenuItem>
)}
```

Add imports: `Clock` from lucide-react.

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/problems/problem-table.tsx
git commit -m "feat(review): add review context menu items to problem table"
```

---

## Task 16: Review Page

**Files:**
- Create: `apps/web/components/review/review-stats-bar.tsx`
- Create: `apps/web/components/review/review-queue.tsx`
- Create: `apps/web/app/(app)/review/page.tsx`

- [ ] **Step 1: Create ReviewStatsBar**

```tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useReviewStats } from "@/hooks/use-reviews"

export function ReviewStatsBar() {
  const { data: stats, isLoading } = useReviewStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const items = [
    { label: "Due Now", value: stats?.dueNow ?? 0, highlight: (stats?.dueNow ?? 0) > 0 },
    { label: "Upcoming (7d)", value: stats?.upcoming7Days ?? 0, highlight: false },
    { label: "Total Enrolled", value: stats?.totalEnrolled ?? 0, highlight: false },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map(({ label, value, highlight }) => (
        <Card key={label}>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${highlight ? "text-orange-500" : ""}`}>
              {value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create ReviewQueue**

```tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DifficultyBadge } from "@/components/problems/difficulty-badge"
import { QuickReviewButtons } from "@/components/review/quick-review-buttons"
import { AttemptForm } from "@/components/problems/attempt-form"
import { useReviewCardsDue } from "@/hooks/use-reviews"

export function ReviewQueue() {
  const { data, isLoading } = useReviewCardsDue()
  const [attemptProblemId, setAttemptProblemId] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = data?.content ?? []

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No problems due for review. You're all caught up!
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {cards.map((card) => {
          const due = new Date(card.due)
          const now = new Date()
          const isOverdue = due < now

          return (
            <Card key={card.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">
                      {card.leetcodeId}
                    </span>
                    <Link
                      href={`/problems/${card.problemId}`}
                      className="font-medium hover:underline truncate"
                    >
                      {card.problemTitle}
                    </Link>
                    <a
                      href={card.problemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <DifficultyBadge difficulty={card.difficulty} />
                    <span>{card.reps} reviews</span>
                    <span>Stability: {card.stability.toFixed(1)}d</span>
                    {isOverdue && (
                      <Badge variant="outline" className="border-red-200 text-red-600 text-[10px]">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>
                <QuickReviewButtons cardId={card.id} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAttemptProblemId(card.problemId)}
                >
                  Log Attempt
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <AttemptForm
        open={attemptProblemId !== null}
        onOpenChange={(open) => {
          if (!open) setAttemptProblemId(null)
        }}
        problemId={attemptProblemId ?? 0}
      />
    </>
  )
}
```

- [ ] **Step 3: Create Review page**

```tsx
// app/(app)/review/page.tsx
import { ReviewStatsBar } from "@/components/review/review-stats-bar"
import { ReviewQueue } from "@/components/review/review-queue"

export default function ReviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Review</h1>
      <ReviewStatsBar />
      <ReviewQueue />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/review/review-stats-bar.tsx \
       apps/web/components/review/review-queue.tsx \
       apps/web/app/\(app\)/review/page.tsx
git commit -m "feat(review): add Review page with stats bar and review queue"
```

---

## Task 17: Sidebar Navigation — Add Review Link

**Files:**
- Modify: `apps/web/components/layout/app-sidebar.tsx`

- [ ] **Step 1: Add Review nav item**

Import `RotateCcw` from lucide-react (or `RefreshCw` — pick a review-appropriate icon).

Add to the `navItems` array, after Dashboard:

```typescript
{ href: "/review", label: "Review", icon: RotateCcw },
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/components/layout/app-sidebar.tsx
git commit -m "feat(review): add Review link to sidebar navigation"
```

---

## Task 18: Dashboard — Due for Review Card

**Files:**
- Create: `apps/web/components/stats/review-due-card.tsx`
- Modify: `apps/web/app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Create ReviewDueCard**

```tsx
"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useReviewStats } from "@/hooks/use-reviews"

export function ReviewDueCard() {
  const { data: stats, isLoading } = useReviewStats()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16" />
        </CardContent>
      </Card>
    )
  }

  const dueNow = stats?.dueNow ?? 0

  return (
    <Link href="/review">
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Due for Review</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${dueNow > 0 ? "text-orange-500" : ""}`}>
            {dueNow}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {dueNow === 0 ? "All caught up" : `${dueNow} problem${dueNow === 1 ? "" : "s"} to review`}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 2: Add ReviewDueCard to Dashboard**

In `app/(app)/dashboard/page.tsx`, import and add after `<StatsCards />`:

```tsx
import { ReviewDueCard } from "@/components/stats/review-due-card"

// In the JSX, after <StatsCards />:
<ReviewDueCard />
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/stats/review-due-card.tsx \
       apps/web/app/\(app\)/dashboard/page.tsx
git commit -m "feat(review): add Due for Review card to dashboard"
```

---

## Verification

After all tasks are complete:

1. **Backend compilation:**
   ```bash
   cd apps/api && ./mvnw compile
   ```

2. **Backend tests:**
   ```bash
   cd apps/api && ./mvnw test
   ```

3. **Frontend compilation:**
   ```bash
   cd apps/web && pnpm build
   ```
   (Use the full pnpm path from MEMORY.md if alias is broken)

4. **Manual testing flow:**
   - Start the backend API and frontend dev server
   - Navigate to `/problems` and add a problem
   - Log an accepted attempt → verify the problem gets a ReviewCard automatically
   - Navigate to `/problems/{id}` → verify the Revision MetaRow shows with state, due date, and review buttons
   - Click "Again" → verify the card updates and shows a new due date
   - Navigate to `/review` → verify the due queue shows the problem
   - Navigate to `/dashboard` → verify the "Due for Review" card shows correct count
   - Right-click a problem in the table → verify "Mark for Revision" / "Remove from Revision" appears
   - Manually enroll an unsolved problem → verify it appears in the review queue
