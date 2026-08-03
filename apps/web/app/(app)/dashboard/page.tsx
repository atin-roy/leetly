"use client"

import Link from "next/link"
import { formatDistanceToNowStrict, parseISO } from "date-fns"
import { ArrowRight } from "lucide-react"
import { DifficultyBadge } from "@/components/problems/difficulty-badge"
import { QuickReviewButtons } from "@/components/review/quick-review-buttons"
import { ConsistencyHeatmap } from "@/components/stats/consistency-heatmap"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useProblemCounts } from "@/hooks/use-problems"
import { useReviewCardsDue, useReviewStats } from "@/hooks/use-reviews"
import { useUserStats } from "@/hooks/use-stats"
import type { Difficulty, ReviewCardDto } from "@/lib/types"
import styles from "./dashboard.module.css"

/*
 * The queue on the dashboard is a prompt, not the queue itself. Past a handful
 * of rows it stops reading as "here is your next thing" and starts competing
 * with /review, which is the page built to work through the whole list.
 */
const QUEUE_PREVIEW_SIZE = 5

const difficulties: Difficulty[] = ["EASY", "MEDIUM", "HARD"]

const difficultyLabel: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
}

export default function DashboardPage() {
  const { data: stats } = useUserStats()
  const { data: counts } = useProblemCounts()
  const { data: reviewStats } = useReviewStats()
  const { data: dueCards, isLoading: dueLoading } = useReviewCardsDue()

  /*
   * Each block waits only on the request it actually needs. Gating the whole
   * page on all four made the queue — the thing this page exists to show, and
   * its largest paint — wait for the slowest of them, including the stats and
   * counts it never reads.
   */
  const dueNow = reviewStats?.dueNow ?? 0
  const solved = counts
    ? counts.byStatus.SOLVED +
      counts.byStatus.SOLVED_WITH_HELP +
      counts.byStatus.MASTERED
    : 0
  const lastSolved = stats?.lastSolvedDate
    ? formatDistanceToNowStrict(parseISO(stats.lastSolvedDate), {
        addSuffix: true,
      })
    : null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Dashboard</p>
          {stats && counts ? (
            <>
              <h1 className={styles.title}>
                {solved} of {counts.total} solved.
              </h1>
              <p className={styles.lede}>
                {lastSolved
                  ? `Last solve ${lastSolved}.`
                  : "No solves logged yet."}
              </p>
            </>
          ) : (
            <Skeleton className={styles.skeletonTitle} />
          )}
        </div>

        {/* No review button here: the queue itself is the next section, and it
            carries its own link through to the full page. */}
        <div className={styles.actions}>
          <Button asChild variant="outline">
            <Link href="/problems">
              All problems
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </header>

      <section>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Due now</h2>
          {dueNow > 0 && (
            <p className={styles.sectionNote}>Oldest first</p>
          )}
        </div>
        {dueLoading ? (
          <Skeleton className={styles.skeletonQueue} />
        ) : (
          <DueQueue cards={dueCards?.content ?? []} total={dueNow} />
        )}
      </section>

      {!stats || !counts ? (
        <DashboardRest />
      ) : (
      <>
      <div className={styles.facts}>
        <Fact label="Due now" value={dueNow} alert={dueNow > 0} />
        <Fact
          label="Streak"
          value={`${stats.currentStreak}d`}
          caption={`Best ${stats.longestStreak}d`}
        />
        <Fact label="This week" value={stats.solvedThisWeek} caption="Solved" />
        <Fact
          label="Unfinished"
          value={counts.byStatus.ATTEMPTED}
          caption="Started, not solved"
        />
        <Fact
          label="Never opened"
          value={counts.byStatus.UNSEEN}
          caption="In your library"
        />
        <Fact
          label="Time logged"
          value={formatHours(stats.totalTimeMinutes)}
          caption={`${stats.totalAttempts} attempts`}
        />
      </div>

      <section>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Activity</h2>
          <p className={styles.sectionNote}>Since your first solve</p>
        </div>
        <ConsistencyHeatmap />
      </section>

      <div className={styles.breakdowns}>
        <section>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>By difficulty</h2>
          </div>
          <BarList
            rows={difficulties.map((difficulty) => ({
              label: difficultyLabel[difficulty],
              value: counts.solvedByDifficulty[difficulty],
              of: counts.byDifficulty[difficulty],
            }))}
            empty="Add problems to see this."
          />
        </section>

        <section>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Mistakes</h2>
          </div>
          <BarList
            rows={parseBreakdown(stats.mistakeBreakdown, titleCase)}
            empty="Log an attempt to see this."
            tone="alert"
          />
        </section>

        <section>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Patterns</h2>
          </div>
          <BarList
            rows={parseBreakdown(stats.patternBreakdown).slice(0, 8)}
            empty="Tag a problem with a pattern to see this."
          />
        </section>
      </div>
      </>
      )}
    </div>
  )
}

/** Placeholder for the reporting half while stats and counts are in flight. */
function DashboardRest() {
  return (
    <>
      <Skeleton className={styles.skeletonFacts} />
      <Skeleton className={styles.skeletonHeatmap} />
      <div className={styles.breakdowns}>
        <Skeleton className={styles.skeletonBars} />
        <Skeleton className={styles.skeletonBars} />
        <Skeleton className={styles.skeletonBars} />
      </div>
    </>
  )
}

function DueQueue({
  cards,
  total,
}: {
  cards: ReviewCardDto[]
  total: number
}) {
  if (cards.length === 0) {
    return (
      <div className={styles.queue}>
        <div className={styles.queueClear}>
          <p className={styles.queueClearTitle}>Queue is clear.</p>
          <p className={styles.queueClearBody}>
            Nothing is due. A good time to start something new.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/problems">Browse problems</Link>
          </Button>
        </div>
      </div>
    )
  }

  const preview = cards.slice(0, QUEUE_PREVIEW_SIZE)
  const remaining = total - preview.length

  return (
    <div className={styles.queue}>
      {preview.map((card) => {
        const due = parseISO(card.due)
        const isOverdue = due < new Date()

        return (
          <div key={card.id} className={styles.queueRow}>
            <span className={styles.queueId}>{card.leetcodeId}</span>
            <Link
              href={`/problems/${card.problemId}`}
              className={styles.queueTitle}
            >
              {card.problemTitle}
            </Link>
            <span
              className={`${styles.queueDue} ${isOverdue ? styles.queueDueOverdue : ""}`}
            >
              <DifficultyBadge difficulty={card.difficulty} />{" "}
              {formatDistanceToNowStrict(due, { addSuffix: true })}
            </span>
            <QuickReviewButtons
              cardId={card.id}
              className={styles.queueActions}
            />
          </div>
        )
      })}

      {remaining > 0 && (
        <p className={styles.queueFoot}>
          <Link href="/review">
            {remaining} more due — open the full queue →
          </Link>
        </p>
      )}
    </div>
  )
}

type BarRow = { label: string; value: number; of?: number }

/*
 * Difficulty, mistakes and patterns are the same widget three times: a label, a
 * count, and a bar scaled against the largest row. `of` switches the readout to
 * a ratio and scales the bar against that row's own total instead.
 */
function BarList({
  rows,
  empty,
  tone,
}: {
  rows: BarRow[]
  empty: string
  tone?: "alert"
}) {
  if (rows.length === 0) {
    return <p className={styles.empty}>{empty}</p>
  }

  const max = Math.max(...rows.map((row) => row.value), 1)

  return (
    <div className={styles.bars}>
      {rows.map((row) => {
        const denominator = row.of ?? max
        const percent = denominator > 0 ? (row.value / denominator) * 100 : 0

        return (
          <div key={row.label} className={styles.bar}>
            <div className={styles.barHead}>
              <span className={styles.barLabel}>{row.label}</span>
              <span className={styles.barValue}>
                {row.value}
                {row.of !== undefined && (
                  <span className={styles.barOf}> / {row.of}</span>
                )}
              </span>
            </div>
            <div className={styles.barTrack}>
              <div
                className={`${styles.barFill} ${tone === "alert" ? styles.barFillAlert : ""}`}
                style={{ width: `${percent.toFixed(1)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
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

function parseBreakdown(
  raw: string | null,
  formatLabel?: (value: string) => string,
): BarRow[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as Record<string, number>
    return Object.entries(parsed)
      .map(([label, value]) => ({
        label: formatLabel ? formatLabel(label) : label,
        value,
      }))
      .sort((a, b) => b.value - a.value)
  } catch {
    return []
  }
}

function titleCase(label: string) {
  return label
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function formatHours(totalMinutes: number) {
  if (totalMinutes < 60) return `${totalMinutes}m`
  const hours = totalMinutes / 60
  return `${hours.toFixed(hours >= 10 ? 0 : 1)}h`
}
