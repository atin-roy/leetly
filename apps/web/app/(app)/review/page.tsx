"use client"

import Link from "next/link"
import { useState } from "react"
import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  parseISO,
  startOfToday,
} from "date-fns"
import { ArrowRight, ExternalLink } from "lucide-react"
import { AttemptForm } from "@/components/problems/attempt-form"
import { DifficultyBadge } from "@/components/problems/difficulty-badge"
import { QuickReviewButtons } from "@/components/review/quick-review-buttons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useReviewCardsDue, useReviewStats } from "@/hooks/use-reviews"
import type { CardState, ReviewCardDto } from "@/lib/types"
import styles from "./review.module.css"

const stateLabel: Record<CardState, string> = {
  NEW: "New",
  LEARNING: "Learning",
  REVIEW: "Review",
  RELEARNING: "Relearning",
}

export default function ReviewPage() {
  const { data: stats, isLoading: statsLoading } = useReviewStats()
  const { data, isLoading: queueLoading } = useReviewCardsDue()
  const [attemptProblemId, setAttemptProblemId] = useState<number | null>(null)

  if (statsLoading || queueLoading) {
    return <ReviewPageSkeleton />
  }

  const cards = data?.content ?? []
  const dueNow = stats?.dueNow ?? 0
  const upcoming = stats?.upcoming7Days ?? 0
  const overdueCards = cards.filter((card) => parseISO(card.due) < new Date())
  const learningCards = cards.filter(
    (card) => card.state === "LEARNING" || card.state === "RELEARNING",
  )
  const matureCards = cards.filter((card) => card.stability >= 14)
  const averageStability =
    cards.length > 0
      ? cards.reduce((sum, card) => sum + card.stability, 0) / cards.length
      : 0

  return (
    <>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Review</p>
            <h1 className={styles.title}>
              {dueNow === 0
                ? "Nothing due today."
                : `${dueNow} ${dueNow === 1 ? "card" : "cards"} due today.`}
            </h1>
            <p className={styles.lede}>
              Rate from memory where you can. Open a full attempt where you
              can&apos;t.
            </p>
          </div>

          <div className={styles.actions}>
            {cards[0] && (
              <Button asChild>
                <Link href={`/problems/${cards[0].problemId}`}>
                  Start first card
                  <ArrowRight />
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/problems">All problems</Link>
            </Button>
          </div>
        </header>

        <div className={styles.facts}>
          <Fact label="Due now" value={dueNow} alert={dueNow > 0} />
          <Fact
            label="Overdue"
            value={overdueCards.length}
            alert={overdueCards.length > 0}
          />
          <Fact label="Learning" value={learningCards.length} />
          <Fact
            label="Mature"
            value={matureCards.length}
            caption="14d or more"
          />
          <Fact label="Next 7 days" value={upcoming} />
          <Fact
            label="Avg stability"
            value={`${averageStability.toFixed(1)}d`}
            caption="Gap before review"
          />
        </div>

        <div className={styles.body}>
          <section>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Due today</h2>
              <p className={styles.sectionNote}>Oldest first</p>
            </div>

            {cards.length === 0 ? (
              <EmptyReviewState />
            ) : (
              <div className={styles.list}>
                {cards.map((card, index) => (
                  <ReviewCardRow
                    key={card.id}
                    card={card}
                    index={index}
                    onLogAttempt={() => setAttemptProblemId(card.problemId)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
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

function Fact({
  label,
  value,
  caption,
  alert = false,
}: {
  label: string
  value: number | string
  caption?: string
  alert?: boolean
}) {
  return (
    <div className={styles.fact}>
      <span className={styles.factLabel}>{label}</span>
      <span
        className={`${styles.factValue} ${alert ? styles.factValueAlert : ""}`}
      >
        {value}
      </span>
      {caption && <span className={styles.factCaption}>{caption}</span>}
    </div>
  )
}

function ReviewCardRow({
  card,
  index,
  onLogAttempt,
}: {
  card: ReviewCardDto
  index: number
  onLogAttempt: () => void
}) {
  const dueDate = parseISO(card.due)
  const isOverdue = dueDate < new Date()
  const dayDelta = differenceInCalendarDays(dueDate, startOfToday())
  const priority = isOverdue ? "Overdue" : dayDelta <= 1 ? "Up next" : "Queued"

  return (
    <article className={styles.row}>
      <div className={styles.rowHead}>
        <span className={styles.queueIndex}>#{index + 1}</span>
        <span className={styles.problemId}>{card.leetcodeId}</span>
        <div className={styles.badges}>
          <Badge variant={isOverdue ? "destructive" : "ghost"}>{priority}</Badge>
          <Badge variant="secondary">
            <span className={styles.stateDot} aria-hidden="true" />
            {stateLabel[card.state]}
          </Badge>
          <DifficultyBadge difficulty={card.difficulty} />
        </div>
      </div>

      <div className={styles.titleRow}>
        <div className={styles.titleCol}>
          <Link href={`/problems/${card.problemId}`} className={styles.title2}>
            {card.problemTitle}
          </Link>
        </div>
        <a
          href={card.problemUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.external}
          aria-label={`Open ${card.problemTitle} on LeetCode`}
        >
          <ExternalLink size={16} />
        </a>
      </div>

      <div className={styles.rowMeta}>
        <span>
          Due <strong>{format(dueDate, "EEE, MMM d")}</strong>{" "}
          {formatDistanceToNowStrict(dueDate, { addSuffix: true })}
        </span>
        <span>
          Stability <strong>{card.stability.toFixed(1)}d</strong>
        </span>
        <span>
          Difficulty <strong>{card.fsrsDifficulty.toFixed(1)}</strong>
        </span>
        <span>
          <strong>{card.reps}</strong> reviews
        </span>
        <span>
          <strong>{card.lapses}</strong> lapses
        </span>
      </div>

      <div className={styles.rowActions}>
        <QuickReviewButtons
          cardId={card.id}
          className={styles.quickButtons}
          buttonClassName={styles.quickButton}
        />
        <Button variant="outline" size="sm" onClick={onLogAttempt}>
          Log attempt
        </Button>
      </div>
    </article>
  )
}

function EmptyReviewState() {
  return (
    <div className={styles.empty}>
      <h3 className={styles.emptyTitle}>Nothing due</h3>
      <p className={styles.emptyBody}>
        Your queue is clear. A good time for new problems.
      </p>
      <Button asChild>
        <Link href="/problems">
          Browse problems
          <ArrowRight />
        </Link>
      </Button>
    </div>
  )
}

function ReviewPageSkeleton() {
  return (
    <div className={styles.skeletonPage}>
      <Skeleton className={styles.skeletonHeader} />
      <Skeleton className={styles.skeletonFacts} />
      <div className={styles.skeletonBody}>
        <Skeleton className={styles.skeletonList} />
      </div>
    </div>
  )
}
