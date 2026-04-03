# Spaced Repetition System (FSRS) Design Spec

## Context

Leetly tracks LeetCode problem-solving progress but lacks a structured way to schedule problem revision. Users solve problems and move on, leading to knowledge decay. This feature adds Anki-style spaced repetition using the FSRS v5 algorithm so users know exactly when to revisit problems for optimal retention.

## Requirements

- **FSRS v5 algorithm** for scheduling (modern, accurate, used by Anki 23.10+)
- **Two review modes:** quick self-assessment (rate Again/Hard/Good/Easy) and full attempt (logs an attempt and feeds outcome into FSRS)
- **Auto-enrollment:** Problems automatically enter the SR queue when first solved. Users can also manually enroll any problem.
- **Manual opt-out:** Users can remove any problem from the SR queue.
- **Accessible from:** problem detail page, problem table rows (context menu + icon), a dedicated `/review` page, and a dashboard summary card.

---

## 1. Data Model

### 1.1 ReviewCard Entity

One per (problem, user) pair. Tracks the FSRS scheduling state.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| id | BIGINT PK | auto | |
| problem_id | BIGINT FK (problems) | required | |
| user_id | BIGINT FK (users) | required | |
| state | ENUM: NEW, LEARNING, REVIEW, RELEARNING | NEW | FSRS card state |
| stability | DOUBLE | 0.0 | Memory stability in days |
| difficulty | DOUBLE | 0.0 | Item difficulty [0, 1] |
| due | TIMESTAMP | now | When next review is due |
| last_review | TIMESTAMP | null | When last reviewed |
| reps | INT | 0 | Total successful reviews |
| lapses | INT | 0 | Times forgotten (rated Again in REVIEW state) |
| scheduled_days | INT | 0 | Current scheduled interval in days |
| elapsed_days | INT | 0 | Days since last review at time of last scheduling |
| created_date | TIMESTAMP | auto | JPA auditing |
| last_modified_date | TIMESTAMP | auto | JPA auditing |

**Constraints:** UNIQUE(problem_id, user_id)

### 1.2 ReviewLog Entity

Immutable log of each review action. Enables analytics and potential parameter optimization.

| Field | Type | Description |
|-------|------|-------------|
| id | BIGINT PK | |
| review_card_id | BIGINT FK | |
| rating | ENUM: AGAIN(1), HARD(2), GOOD(3), EASY(4) | User's rating |
| state | ENUM | Card state BEFORE this review |
| stability | DOUBLE | Stability BEFORE this review |
| difficulty | DOUBLE | Difficulty BEFORE this review |
| elapsed_days | INT | Days since previous review |
| scheduled_days | INT | Interval that was scheduled |
| review_type | ENUM: QUICK_ASSESSMENT, FULL_ATTEMPT | How the review was done |
| attempt_id | BIGINT FK (nullable) | Linked attempt if review_type = FULL_ATTEMPT |
| reviewed_at | TIMESTAMP | When the review happened |

### 1.3 Migration

New migration `V12__review_cards.sql`:
- Creates `review_cards` table with unique constraint on (problem_id, user_id)
- Creates `review_logs` table
- Indexes: `review_cards(user_id, due)` for "what's due" queries, `review_cards(user_id, state)` for state filtering

---

## 2. FSRS v5 Algorithm

### 2.1 Implementation

A standalone Java utility class `FsrsScheduler` with no Spring dependencies. Pure functions operating on card state.

**Core API:**
```java
public class FsrsScheduler {
    SchedulingResult schedule(ReviewCard card, Rating rating, Instant now);
}

public record SchedulingResult(
    double stability,
    double difficulty,
    Instant due,
    CardState state,
    int scheduledDays,
    int elapsedDays,
    int reps,
    int lapses
) {}
```

### 2.2 State Machine

```
NEW ──(any rating)──> LEARNING
LEARNING ──(Good/Easy)──> REVIEW
LEARNING ──(Again/Hard)──> LEARNING (short interval)
REVIEW ──(Hard/Good/Easy)──> REVIEW (longer interval)
REVIEW ──(Again)──> RELEARNING (lapse++)
RELEARNING ──(Good/Easy)──> REVIEW
RELEARNING ──(Again/Hard)──> RELEARNING (short interval)
```

### 2.3 Parameters

FSRS v5 uses 19 optimizable parameters. We use Anki's published defaults initially. Parameters are defined as constants in `FsrsScheduler`. Future enhancement: store per-user parameters in `UserSettings` for personalized scheduling.

### 2.4 Attempt-to-Rating Mapping

When a full attempt is logged on a problem with a ReviewCard, the attempt outcome maps to a rating:
- ACCEPTED (first try, fast) → EASY
- ACCEPTED (normal) → GOOD
- ACCEPTED (with mistakes/slow) → HARD
- Any non-accepted outcome → AGAIN

The heuristic: if `durationMinutes` is provided and the attempt has no mistakes, it's EASY. If accepted with mistakes, it's HARD. This is a reasonable default; the user can always do a quick self-assessment instead for precise control.

---

## 3. Backend API

### 3.1 New Package Structure

```
com.atinroy.leetly.review/
  model/
    ReviewCard.java
    ReviewLog.java
    CardState.java      (enum: NEW, LEARNING, REVIEW, RELEARNING)
    Rating.java          (enum: AGAIN, HARD, GOOD, EASY)
    ReviewType.java      (enum: QUICK_ASSESSMENT, FULL_ATTEMPT)
  repository/
    ReviewCardRepository.java
    ReviewLogRepository.java
  service/
    ReviewService.java
    FsrsScheduler.java
  controller/
    ReviewController.java
  dto/
    ReviewCardDto.java
    ReviewLogDto.java
    ReviewStatsDto.java
    QuickReviewRequest.java
  mapper/
    ReviewMapper.java    (MapStruct)
```

### 3.2 Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/review-cards | Manually enroll a problem (body: `{ problemId }`) |
| DELETE | /api/review-cards/{id} | Remove from SR queue |
| GET | /api/review-cards/due | Due/overdue cards, paginated, sorted by due ASC |
| GET | /api/review-cards/stats | Counts: due today, overdue, upcoming 7d, total enrolled, retention |
| POST | /api/review-cards/{id}/review | Quick self-assessment (body: `{ rating }`) |
| GET | /api/review-cards/{id}/history | Review log for a card |

### 3.3 Integration with Existing Services

**AttemptService.logAttempt() changes:**
1. After logging an attempt, check if the problem has a ReviewCard
2. If yes and outcome is ACCEPTED: feed into FSRS scheduler (map outcome to rating, create ReviewLog with type=FULL_ATTEMPT)
3. If no ReviewCard exists and outcome is ACCEPTED and problem status transitions to SOLVED: auto-create a ReviewCard with state=NEW

**ProblemService changes:**
- `findDetailById()` should include ReviewCard data (due date, state) if one exists — added to ProblemDetailDto
- `delete()` should cascade-delete the ReviewCard

**ProblemSpecification changes:**
- Add filter for `hasReviewCard` (boolean) to filter enrolled problems
- Add filter for `reviewDue` (boolean) to filter problems due for review

---

## 4. Frontend

### 4.1 New Hooks — `hooks/use-reviews.ts`

```typescript
useReviewCardsDue(filters?)   // GET /api/review-cards/due
useReviewStats()               // GET /api/review-cards/stats
useEnrollReview()              // POST /api/review-cards
useRemoveReview()              // DELETE /api/review-cards/{id}
useQuickReview()               // POST /api/review-cards/{id}/review
useReviewHistory(cardId)       // GET /api/review-cards/{id}/history
```

### 4.2 Problem Detail Page Changes

**New "Revision" metadata row** (below existing metadata rows):
- If enrolled: shows state badge (Learning/Review/Relearning), due date (relative: "Due in 3 days" / "Overdue by 2 days"), stability, and a "Remove" button
- If not enrolled: shows an "Add to Review" button
- **Quick review buttons:** When the card is due/overdue, show Again / Hard / Good / Easy buttons inline

### 4.3 Problem Table Changes

**New column: Review indicator icon** (after the note indicator column):
- Not enrolled: no icon (or faint grey clock on hover for discoverability)
- Enrolled, not due: green check icon
- Due today: orange clock icon
- Overdue: red clock icon with pulse/glow

**Context menu additions:**
- "Mark for Revision" (if not enrolled)
- "Remove from Revision" (if enrolled)

### 4.4 New Review Page — `/review`

**Route:** `app/(app)/review/page.tsx`

**Sections:**
1. **Stats bar** at top: Due today (count), Overdue (count), Upcoming 7 days (count), Total enrolled
2. **Review queue** — list/cards of due problems, sorted overdue-first:
   - Problem title, difficulty badge, LeetCode ID
   - Last reviewed date, times reviewed, current stability
   - Quick-review buttons: Again / Hard / Good / Easy
   - "Open Problem" link to detail page
   - "Log Attempt" button to open attempt form
3. **Filters:** All due / Overdue only / Upcoming 7 days

**Sidebar navigation:** Add "Review" item with a badge showing due count.

### 4.5 Dashboard Changes

**New "Due for Review" card:**
- Shows count of problems due today
- Overdue count if any (highlighted)
- Links to `/review` page

---

## 5. Key Decisions

1. **FSRS v5 over SM-2:** More accurate scheduling, better initial stability estimates, widely adopted by modern Anki.
2. **Standalone ReviewCard entity:** Clean separation from Problem and Attempt. FSRS state doesn't pollute existing models.
3. **ReviewLog is immutable:** Append-only history enables analytics and future parameter optimization.
4. **Auto-enroll on first solve:** Reduces friction. Users don't have to remember to opt in.
5. **Attempt outcome feeds FSRS:** When you solve a problem as a full attempt, the review card updates automatically. No double-action needed.
6. **Quick review is the default path:** The review page is designed for fast triage — see problem, rate confidence, move on.

---

## 6. Out of Scope (Future)

- Per-user FSRS parameter optimization (analyzing ReviewLog data)
- Review session mode (timed, sequential card presentation like Anki)
- Notification/email reminders for due reviews
- Heatmap/calendar visualization of review history
- Export/import of review data
