"use client"

import Link from "next/link"
import type { ComponentType } from "react"
import { useState } from "react"
import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  parseISO,
  startOfToday,
} from "date-fns"
import {
  AlarmClockCheck,
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  CircleAlert,
  ExternalLink,
  Layers3,
  Orbit,
  Sparkles,
  TimerReset,
} from "lucide-react"
import { AttemptForm } from "@/components/problems/attempt-form"
import { DifficultyBadge } from "@/components/problems/difficulty-badge"
import { QuickReviewButtons } from "@/components/review/quick-review-buttons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useReviewCardsDue, useReviewStats } from "@/hooks/use-reviews"
import type { CardState, ReviewCardDto } from "@/lib/types"
import { cn } from "@/lib/utils"

const stateTone: Record<
  CardState,
  {
    label: string
    chip: string
    dot: string
  }
> = {
  NEW: {
    label: "New",
    chip:
      "border-cyan-400/30 bg-cyan-400/[0.08] text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/[0.08] dark:text-cyan-100",
    dot: "bg-cyan-300",
  },
  LEARNING: {
    label: "Learning",
    chip:
      "border-amber-400/35 bg-amber-400/[0.08] text-amber-700 dark:border-amber-300/20 dark:bg-amber-300/[0.08] dark:text-amber-100",
    dot: "bg-amber-300",
  },
  REVIEW: {
    label: "Review",
    chip:
      "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-300/[0.08] dark:text-emerald-100",
    dot: "bg-emerald-300",
  },
  RELEARNING: {
    label: "Relearning",
    chip:
      "border-rose-400/30 bg-rose-400/[0.08] text-rose-700 dark:border-rose-300/20 dark:bg-rose-300/[0.08] dark:text-rose-100",
    dot: "bg-rose-300",
  },
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
  const totalEnrolled = stats?.totalEnrolled ?? 0
  const today = startOfToday()
  const overdueCards = cards.filter((card) => parseISO(card.due) < new Date())
  const learningCards = cards.filter(
    (card) => card.state === "LEARNING" || card.state === "RELEARNING"
  )
  const matureCards = cards.filter((card) => card.stability >= 14)
  const averageStability =
    cards.length > 0 ? cards.reduce((sum, card) => sum + card.stability, 0) / cards.length : 0
  const urgentWindowCount = cards.filter((card) => {
    const dueDate = parseISO(card.due)
    const dayDiff = differenceInCalendarDays(dueDate, today)
    return dayDiff >= 0 && dayDiff <= 2
  }).length
  const nextDueCard = [...cards]
    .sort((a, b) => parseISO(a.due).getTime() - parseISO(b.due).getTime())[0] ?? null
  const dailyCapacity =
    dueNow === 0 ? "Cruise" : dueNow <= 3 ? "Light" : dueNow <= 8 ? "Focused" : "Recovery"
  const estimatedSweepMinutes = Math.max(cards.length * 3, dueNow * 4)

  return (
    <>
      <div className="space-y-6 pb-2">
        <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
          <Card className="overflow-hidden rounded-[30px] border-border/70 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_26%,transparent),transparent_32%),radial-gradient(circle_at_78%_18%,color-mix(in_oklab,var(--accent)_18%,transparent),transparent_24%),linear-gradient(180deg,color-mix(in_oklab,var(--card)_92%,var(--background)_8%),color-mix(in_oklab,var(--background)_84%,black_16%))] shadow-[0_30px_90px_color-mix(in_oklab,var(--foreground)_12%,transparent)]">
            <CardContent className="relative px-6 py-6 sm:px-7 sm:py-7">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--foreground)_5%,transparent),transparent_28%,transparent_70%,color-mix(in_oklab,var(--foreground)_3%,transparent))]" />
              <div className="relative space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl space-y-3">
                    <Badge className="w-fit border-border/70 bg-background/55 text-[11px] uppercase tracking-[0.24em] text-primary hover:bg-background/55">
                      Review rhythm
                    </Badge>
                    <div className="space-y-2">
                      <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                        Keep recall sharp before drift turns into relearning.
                      </h1>
                      <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
                        Clear today&apos;s highest-friction cards, preserve spaced repetition
                        momentum, and decide where a full attempt is worth the extra time.
                      </p>
                    </div>
                  </div>

                  <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[290px]">
                    <HeroMetric
                      icon={AlarmClockCheck}
                      label="Due now"
                      value={dueNow}
                      detail={dueNow > 0 ? `${overdueCards.length} already overdue` : "Queue is calm"}
                    />
                    <HeroMetric
                      icon={Orbit}
                      label="Enrolled"
                      value={totalEnrolled}
                      detail={`${cards.length} currently surfaced`}
                    />
                    <HeroMetric
                      icon={BrainCircuit}
                      label="Learning"
                      value={learningCards.length}
                      detail="Higher-touch cards need closer follow-up"
                    />
                    <HeroMetric
                      icon={TimerReset}
                      label="Sweep time"
                      value={`${estimatedSweepMinutes}m`}
                      detail={`${dailyCapacity} session intensity`}
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <MiniSignal
                    label="Priority load"
                    value={overdueCards.length}
                    caption="Cards already past due"
                  />
                  <MiniSignal
                    label="Next 72h"
                    value={urgentWindowCount}
                    caption="Due soon enough to plan around"
                  />
                  <MiniSignal
                    label="Mature cards"
                    value={matureCards.length}
                    caption="Stability at 14 days or more"
                  />
                  <MiniSignal
                    label="Avg stability"
                    value={`${averageStability.toFixed(1)}d`}
                    caption="Current retention buffer"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="h-11 rounded-full px-5 text-sm">
                    <Link href={cards[0] ? `/problems/${cards[0].problemId}` : "/problems"}>
                      Start first card
                      <ArrowRight />
                    </Link>
                  </Button>
                  <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-11 rounded-full border-border/70 bg-background/55 px-5 text-sm text-foreground hover:bg-background/80 hover:text-foreground"
                >
                  <Link href="/problems">Browse all problems</Link>
                </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_94%,var(--background)_6%),color-mix(in_oklab,var(--background)_88%,black_12%))] shadow-[0_24px_80px_color-mix(in_oklab,var(--foreground)_10%,transparent)]">
            <CardHeader className="gap-3 border-b border-border/70 pb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl tracking-tight">Queue health</CardTitle>
                  <CardDescription className="mt-1">
                    Read the pressure level before you choose between quick ratings and full attempts.
                  </CardDescription>
                </div>
                <div
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
                    dueNow > 6
                      ? "border border-rose-400/25 bg-rose-400/[0.12] text-rose-700 dark:text-rose-200"
                      : dueNow > 0
                        ? "border border-amber-400/25 bg-amber-400/[0.12] text-amber-700 dark:text-amber-200"
                        : "border border-emerald-400/25 bg-emerald-400/[0.12] text-emerald-700 dark:text-emerald-200"
                  )}
                >
                  {dailyCapacity} load
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                <HealthStat label="Due now" value={dueNow} tone={dueNow > 0 ? "warm" : "calm"} />
                <HealthStat label="Upcoming 7d" value={upcoming} tone="neutral" />
                <HealthStat label="Overdue" value={overdueCards.length} tone={overdueCards.length > 0 ? "risk" : "neutral"} />
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Next checkpoint
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {nextDueCard ? (
                        <>
                          The next card opens{" "}
                          <span className="font-medium text-foreground">
                            {formatDistanceToNowStrict(parseISO(nextDueCard.due), {
                              addSuffix: true,
                            })}
                          </span>{" "}
                          for{" "}
                          <span className="font-semibold text-foreground">
                            {nextDueCard.problemTitle}
                          </span>
                          .
                        </>
                      ) : (
                        "No review card is waiting right now. You can spend the block on fresh problems or full attempts."
                      )}
                    </p>
                  </div>
                  <CalendarClock className="mt-1 h-5 w-5 text-primary/75" />
                </div>
              </div>

              <div className="space-y-4">
                <PressureRow
                  label="Cards due now"
                  value={dueNow}
                  total={Math.max(totalEnrolled, 1)}
                  accent="from-rose-400 to-orange-300"
                />
                <PressureRow
                  label="Cards in learning"
                  value={learningCards.length}
                  total={Math.max(cards.length, 1)}
                  accent="from-amber-300 to-yellow-200"
                />
                <PressureRow
                  label="Mature stability"
                  value={matureCards.length}
                  total={Math.max(cards.length, 1)}
                  accent="from-emerald-400 to-teal-300"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
          <Card className="rounded-[30px] border-border/70">
            <CardHeader className="gap-3 border-b border-border/70 pb-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl tracking-tight">Today&apos;s review stack</CardTitle>
                  <CardDescription className="mt-1">
                    Prioritized cards with enough context to decide whether to rate quickly or re-attempt.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Pill label="Visible now" value={`${cards.length}`} />
                  <Pill label="Needs action" value={`${Math.max(dueNow, overdueCards.length)}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {cards.length === 0 ? (
                <EmptyReviewState />
              ) : (
                <div className="space-y-4">
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
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[30px]">
              <CardHeader className="gap-3 border-b border-border/70 pb-4">
                <CardTitle className="text-xl tracking-tight">Session guide</CardTitle>
                <CardDescription>
                  A cleaner review flow keeps the queue useful instead of noisy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <GuideRow
                  icon={CircleAlert}
                  title="Clear overdue first"
                  body="Handle the oldest cards before taking on soon-due ones so interval drift does not compound."
                />
                <GuideRow
                  icon={Sparkles}
                  title="Use quick ratings for recall"
                  body="If you can explain the idea and key edge cases from memory, rate directly and keep moving."
                />
                <GuideRow
                  icon={Layers3}
                  title="Log full attempts selectively"
                  body="Open a full attempt only when recall is fuzzy, the implementation path feels weak, or the mistake pattern is repeating."
                />
              </CardContent>
            </Card>

            <Card className="rounded-[30px]">
              <CardHeader className="gap-3 border-b border-border/70 pb-4">
                <CardTitle className="text-xl tracking-tight">Queue snapshot</CardTitle>
                <CardDescription>
                  Short signals to help you choose the shape of this study block.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <SnapshotTile
                  label="Immediate pressure"
                  value={dueNow > 0 ? `${dueNow} due now` : "No urgent cards"}
                  detail={dueNow > 0 ? "Start with quick assessments to reduce drag." : "This is a good window for fresh problems."}
                />
                <SnapshotTile
                  label="Upcoming wave"
                  value={`${upcoming} in 7 days`}
                  detail="A larger upcoming wave means today is a good day to get ahead of the queue."
                />
                <SnapshotTile
                  label="Retention base"
                  value={`${matureCards.length} mature cards`}
                  detail={
                    matureCards.length > 0
                      ? "Longer intervals are forming; avoid letting overdue cards chip away at them."
                      : "Most cards are still young, so consistency matters more than volume."
                  }
                />
              </CardContent>
            </Card>
          </div>
        </section>
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

function ReviewPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Skeleton className="h-[350px] w-full rounded-[30px]" />
        <Skeleton className="h-[350px] w-full rounded-[30px]" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Skeleton className="h-[680px] w-full rounded-[30px]" />
        <div className="space-y-6">
          <Skeleton className="h-[260px] w-full rounded-[30px]" />
          <Skeleton className="h-[280px] w-full rounded-[30px]" />
        </div>
      </div>
    </div>
  )
}

function HeroMetric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: number | string
  detail: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/50 p-3.5 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
        </div>
        <Icon className="mt-0.5 h-4 w-4 text-primary/70" />
      </div>
    </div>
  )
}

function MiniSignal({
  label,
  value,
  caption,
}: {
  label: string
  value: number | string
  caption: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-[color-mix(in_oklab,var(--background)_55%,var(--card)_45%)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
    </div>
  )
}

function HealthStat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "warm" | "calm" | "neutral" | "risk"
}) {
  const toneClass =
    tone === "warm"
      ? "border-amber-400/25 bg-amber-400/[0.12] text-amber-700 dark:text-amber-200"
      : tone === "calm"
        ? "border-emerald-400/25 bg-emerald-400/[0.12] text-emerald-700 dark:text-emerald-200"
        : tone === "risk"
          ? "border-rose-400/25 bg-rose-400/[0.12] text-rose-700 dark:text-rose-200"
          : "border-border/70 bg-background/40 text-foreground"

  return (
    <div className={cn("rounded-2xl border p-4", toneClass)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function PressureRow({
  label,
  value,
  total,
  accent,
}: {
  label: string
  value: number
  total: number
  accent: string
}) {
  const width = Math.min((value / total) * 100, 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums text-foreground">
          {value}
          <span className="text-muted-foreground"> / {total}</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted/70">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r", accent)}
          style={{ width: `${width.toFixed(1)}%` }}
        />
      </div>
    </div>
  )
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-border/70 bg-muted/[0.45] px-3 py-1.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-2 font-semibold text-foreground">{value}</span>
    </div>
  )
}

function EmptyReviewState() {
  return (
    <div className="rounded-[28px] border border-dashed border-border/80 bg-muted/[0.18] px-6 py-12 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center space-y-3">
        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-300">
          <AlarmClockCheck className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight">No cards due right now</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Your review queue is clear. Use the breathing room for new problems, deeper full attempts, or cleanup on older notes.
        </p>
        <Button asChild className="mt-2 rounded-full px-5">
          <Link href="/problems">
            Explore problems
            <ArrowRight />
          </Link>
        </Button>
      </div>
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
  const now = new Date()
  const dueDistance = formatDistanceToNowStrict(dueDate, { addSuffix: true })
  const isOverdue = dueDate < now
  const dayDelta = differenceInCalendarDays(dueDate, startOfToday())
  const stateInfo = stateTone[card.state]
  const priority = isOverdue ? "High priority" : dayDelta <= 1 ? "Up next" : "Queued"
  const priorityClass = isOverdue
    ? "border-rose-400/30 bg-rose-400/[0.08] text-rose-700 dark:border-rose-300/20 dark:bg-rose-300/[0.08] dark:text-rose-100"
    : dayDelta <= 1
      ? "border-amber-400/35 bg-amber-400/[0.08] text-amber-700 dark:border-amber-300/20 dark:bg-amber-300/[0.08] dark:text-amber-100"
      : "border-slate-300/70 bg-slate-200/55 text-slate-700 dark:border-cyan-300/20 dark:bg-cyan-300/[0.08] dark:text-cyan-100"

  return (
    <div className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,252,0.94))] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[linear-gradient(180deg,rgba(10,19,24,0.96),rgba(8,15,20,0.96))] dark:shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-slate-300/70 bg-slate-100/80 text-[11px] uppercase tracking-[0.18em] text-slate-600 hover:bg-slate-100/80 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/[0.55] dark:hover:bg-white/[0.04]">
                Queue #{index + 1}
              </Badge>
              <Badge className={cn("border text-[11px] uppercase tracking-[0.18em] hover:bg-transparent", priorityClass)}>
                {priority}
              </Badge>
              <Badge className={cn("border text-[11px] uppercase tracking-[0.18em] hover:bg-transparent", stateInfo.chip)}>
                <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", stateInfo.dot)} />
                {stateInfo.label}
              </Badge>
              <DifficultyBadge difficulty={card.difficulty} />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-white/[0.55]">
                <span className="font-mono text-xs">{card.leetcodeId}</span>
                <span className="text-slate-400 dark:text-white/[0.28]">/</span>
                <span className="capitalize">{card.problemStatus.toLowerCase()}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/problems/${card.problemId}`}
                    className="block truncate text-xl font-semibold tracking-tight text-slate-950 hover:text-primary dark:text-white dark:hover:text-cyan-200"
                  >
                    {card.problemTitle}
                  </Link>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-white/[0.62]">
                    Due {dueDistance}. Scheduled for {Math.max(card.scheduledDays, 0)} days with{" "}
                    {card.reps} total reviews and {card.lapses} lapses so far.
                  </p>
                </div>
                <a
                  href={card.problemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300/70 bg-white/70 p-2 text-slate-500 transition-colors hover:text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/[0.54] dark:hover:text-white"
                  aria-label={`Open ${card.problemTitle} on LeetCode`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[290px] lg:grid-cols-1">
            <ReviewMetric label="Due" value={format(dueDate, "EEE, MMM d")} detail={format(dueDate, "h:mm a")} />
            <ReviewMetric label="Stability" value={`${card.stability.toFixed(1)}d`} detail={`${card.elapsedDays}d elapsed`} />
            <ReviewMetric label="FSRS diff." value={card.fsrsDifficulty.toFixed(1)} detail={`${card.state.toLowerCase()} state`} />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-100/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/[0.45]">
              Review action
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/[0.62]">
              Rate from memory when recall is clean. If the implementation path feels shaky, log a full attempt and capture the failure mode instead.
            </p>
            <QuickReviewButtons
              cardId={card.id}
              className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-4"
              buttonClassName="h-10 rounded-xl text-sm"
            />
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-100/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/[0.45]">
                Full attempt
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/[0.62]">
                Use a deeper attempt when you need to rebuild the solution path, not just validate recognition.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-4 h-10 rounded-xl justify-between border-slate-300/80 bg-white/80 text-slate-800 hover:bg-white dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]"
              onClick={onLogAttempt}
            >
              Log attempt
              <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewMetric({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-100/75 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.05]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/[0.42]">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-white/[0.5]">{detail}</p>
    </div>
  )
}

function GuideRow({
  icon: Icon,
  title,
  body,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/[0.25] p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full border border-border/70 bg-background/80 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
        </div>
      </div>
    </div>
  )
}

function SnapshotTile({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/[0.22] p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  )
}
