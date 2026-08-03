"use client"

import Link from "next/link"
import type { ComponentType } from "react"
import {
  addDays,
  differenceInCalendarDays,
  formatDistanceToNowStrict,
  parseISO,
  startOfToday,
} from "date-fns"
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  Flame,
  Layers3,
  Radar,
  Sparkles,
  Target,
} from "lucide-react"
import { ActivityBar } from "@/components/stats/activity-calendar"
import { ConsistencyHeatmap } from "@/components/stats/consistency-heatmap"
import { MistakesChart } from "@/components/stats/mistakes-chart"
import { PatternBreakdown } from "@/components/stats/pattern-breakdown"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProblems } from "@/hooks/use-problems"
import { useReviewStats } from "@/hooks/use-reviews"
import { useDailyStats, useUserStats } from "@/hooks/use-stats"
import { cn } from "@/lib/utils"

const difficultyAccent = {
  EASY: {
    label: "Easy",
    text: "text-emerald-300",
    bar: "from-emerald-400 to-emerald-300",
    glow: "bg-emerald-400/[0.12]",
  },
  MEDIUM: {
    label: "Medium",
    text: "text-amber-300",
    bar: "from-amber-400 to-yellow-300",
    glow: "bg-amber-400/[0.12]",
  },
  HARD: {
    label: "Hard",
    text: "text-rose-300",
    bar: "from-rose-400 to-red-300",
    glow: "bg-rose-400/[0.12]",
  },
} as const

function formatHours(totalMinutes: number) {
  if (totalMinutes < 60) {
    return `${totalMinutes}m`
  }

  const hours = totalMinutes / 60
  return `${hours.toFixed(hours >= 10 ? 0 : 1)}h`
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-[320px] w-full rounded-3xl" />
        <Skeleton className="h-[320px] w-full rounded-3xl" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-[340px] w-full rounded-3xl" />
        <Skeleton className="h-[340px] w-full rounded-3xl" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-[280px] w-full rounded-3xl" />
        <Skeleton className="h-[280px] w-full rounded-3xl" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useUserStats()
  const { data: dailyStats, isLoading: dailyLoading } = useDailyStats()
  const { data: reviewStats, isLoading: reviewLoading } = useReviewStats()
  const { data: problemsPage, isLoading: problemsLoading } = useProblems({ size: 1000 })

  if (statsLoading || dailyLoading || reviewLoading || problemsLoading || !stats) {
    return <DashboardSkeleton />
  }

  const problems = problemsPage?.content ?? []
  const totalSolved = stats.totalSolved + stats.totalSolvedWithHelp + stats.totalMastered
  const totalProblems = problemsPage?.totalElements ?? totalSolved
  const completionRate = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0
  const attemptedBacklog = problems.filter((problem) => problem.status === "ATTEMPTED").length
  const unseenCount = problems.filter((problem) => problem.status === "UNSEEN").length
  const dueNow = reviewStats?.dueNow ?? 0
  const upcoming = reviewStats?.upcoming7Days ?? 0
  const reviewEnrolled = reviewStats?.totalEnrolled ?? 0
  const activeDays = (dailyStats ?? []).filter((day) => day.solved > 0).length
  const firstSolvedStat = (dailyStats ?? []).find((day) => day.solved > 0)
  const trackedDays = firstSolvedStat
    ? Math.max(
        differenceInCalendarDays(startOfToday(), parseISO(firstSolvedStat.date)) + 1,
        1
      )
    : 0
  const consistencyRate = trackedDays > 0 ? Math.round((activeDays / trackedDays) * 100) : 0
  const solvedLast7Days = (dailyStats ?? [])
    .filter((day) => {
      const date = parseISO(day.date)
      const diff = differenceInCalendarDays(startOfToday(), date)
      return diff >= 0 && diff < 7
    })
    .reduce((sum, day) => sum + day.solved, 0)
  const attemptedLast7Days = (dailyStats ?? [])
    .filter((day) => {
      const date = parseISO(day.date)
      const diff = differenceInCalendarDays(startOfToday(), date)
      return diff >= 0 && diff < 7
    })
    .reduce((sum, day) => sum + day.attempted, 0)
  const solvedToday = (dailyStats ?? []).find((day) => day.date === formatIsoDate(startOfToday()))?.solved ?? 0
  const nextBusyWindowEnd = addDays(startOfToday(), 7)

  const difficultyRows = [
    {
      key: "EASY",
      solved: stats.easySolved,
      total: problems.filter((problem) => problem.difficulty === "EASY").length,
    },
    {
      key: "MEDIUM",
      solved: stats.mediumSolved,
      total: problems.filter((problem) => problem.difficulty === "MEDIUM").length,
    },
    {
      key: "HARD",
      solved: stats.hardSolved,
      total: problems.filter((problem) => problem.difficulty === "HARD").length,
    },
  ] as const

  const topMistake = parseTopEntry(stats.mistakeBreakdown, formatBreakdownLabel)
  const topPattern = parseTopEntry(stats.patternBreakdown)
  const lastSolvedLabel = stats.lastSolvedDate
    ? `${formatDistanceToNowStrict(parseISO(stats.lastSolvedDate), { addSuffix: true })}`
    : "No solves yet"

  return (
    <div className="space-y-6 pb-2">
      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden rounded-[28px] border-border/70 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_28%,transparent),transparent_34%),radial-gradient(circle_at_72%_30%,color-mix(in_oklab,var(--accent)_18%,transparent),transparent_22%),linear-gradient(180deg,color-mix(in_oklab,var(--card)_92%,var(--background)_8%),color-mix(in_oklab,var(--background)_84%,black_16%))] shadow-[0_24px_80px_color-mix(in_oklab,var(--foreground)_12%,transparent)]">
          <CardContent className="relative px-6 py-6 sm:px-7 sm:py-7">
            <div className="relative space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl space-y-3">
                  <Badge className="w-fit border-border/70 bg-background/55 text-[11px] tracking-[0.22em] text-primary uppercase hover:bg-background/55">
                    Dashboard
                  </Badge>
                  <div className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                      {totalSolved} of {totalProblems} solved.
                    </h1>
                    <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
                      What is due, what you left unfinished, and where the same
                      mistakes keep showing up.
                    </p>
                  </div>
                </div>

                <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[280px]">
                  <MetricChip
                    icon={Target}
                    label="Completion"
                    value={`${completionRate}%`}
                    detail={`${totalSolved} of ${totalProblems} solved`}
                  />
                  <MetricChip
                    icon={Flame}
                    label="Streak"
                    value={`${stats.currentStreak}d`}
                    detail={`Best run ${stats.longestStreak}d`}
                  />
                  <MetricChip
                    icon={Clock3}
                    label="Time logged"
                    value={formatHours(stats.totalTimeMinutes)}
                    detail={`${stats.totalAttempts} attempts logged`}
                  />
                  <MetricChip
                    icon={Sparkles}
                    label="Last solve"
                    value={stats.lastSolvedDate ? lastSolvedLabel : "Never"}
                    detail={stats.lastSolvedDate ? "Most recent solve" : "No solves logged yet"}
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <MiniStat
                  label="Solved this week"
                  value={stats.solvedThisWeek}
                  caption={`${solvedToday} solved today`}
                />
                <MiniStat
                  label="Mastered"
                  value={stats.totalMastered}
                  caption={`${stats.firstAttemptSolves} solved first try`}
                />
                <MiniStat
                  label="Unfinished"
                  value={attemptedBacklog}
                  caption={`${unseenCount} never opened`}
                />
                <MiniStat
                  label="Patterns"
                  value={stats.distinctPatternsCovered}
                  caption={`Across ${stats.distinctTopicsCovered} topics`}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-11 rounded-full px-5 text-sm">
                  <Link href="/review">
                    Review queue
                    <ArrowRight />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-11 rounded-full border-border/70 bg-background/55 px-5 text-sm text-foreground hover:bg-background/80 hover:text-foreground"
                >
                  <Link href="/problems">All problems</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_94%,var(--background)_6%),color-mix(in_oklab,var(--background)_88%,black_12%))] shadow-[0_24px_80px_color-mix(in_oklab,var(--foreground)_10%,transparent)]">
          <CardHeader className="gap-3 border-b border-border/70 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl tracking-tight">Reviews</CardTitle>
                <CardDescription className="mt-1">
                  What is due now and what is coming.
                </CardDescription>
              </div>
              <div className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
                dueNow > 0
                  ? "border border-orange-400/25 bg-orange-400/[0.12] text-orange-700 dark:text-orange-200"
                  : "border border-emerald-400/25 bg-emerald-400/[0.12] text-emerald-700 dark:text-emerald-200"
              )}>
                {dueNow > 0 ? `${dueNow} due` : "Clear"}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              <ReviewStat label="Due now" value={dueNow} tone={dueNow > 0 ? "warning" : "calm"} />
              <ReviewStat label="Next 7 days" value={upcoming} tone="neutral" />
              <ReviewStat label="Enrolled" value={reviewEnrolled} tone="neutral" />
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Coming up
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {upcoming + dueNow} reviews
                    </span>{" "}
                    between now and{" "}
                    <span className="font-medium text-foreground">
                      {formatDistanceToNowStrict(nextBusyWindowEnd, { addSuffix: true })}
                    </span>
                    .
                  </p>
                </div>
                <Radar className="mt-1 h-5 w-5 text-primary/75" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InsightRow
                label="Current streak"
                value={`${stats.currentStreak} days`}
                caption={`Longest ${stats.longestStreak} days`}
              />
              <InsightRow
                label="Last 7 days"
                value={`${solvedLast7Days} solved`}
                caption={`${attemptedLast7Days} attempts`}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="rounded-[28px]">
          <CardHeader className="gap-3 border-b border-border/70 pb-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl tracking-tight">Activity</CardTitle>
                <CardDescription className="mt-1">
                  Every day since your first solve.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Pill label="Days active" value={`${consistencyRate}%`} />
                <Pill label="This month" value={`${stats.solvedThisMonth}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-5">
            <div className="grid gap-3 md:grid-cols-3">
              <AnalyticsTile
                icon={CheckCircle2}
                label="Solved this week"
                value={solvedLast7Days}
                caption="Solved in the last 7 days"
              />
              <AnalyticsTile
                icon={Brain}
                label="Days active"
                value={`${consistencyRate}%`}
                caption={`${activeDays} days with a solve`}
              />
              <AnalyticsTile
                icon={Layers3}
                label="Attempts"
                value={attemptedLast7Days}
                caption="Attempts in the last 7 days"
              />
            </div>
            <Tabs defaultValue="consistency" className="gap-4">
              <div className="flex justify-end">
                <TabsList className="h-10 rounded-full border border-border/70 bg-background/35 p-1">
                  <TabsTrigger
                    value="consistency"
                    className="rounded-full px-4 text-xs tracking-[0.16em] uppercase data-[state=active]:bg-background"
                  >
                    Consistency
                  </TabsTrigger>
                  <TabsTrigger
                    value="volume"
                    className="rounded-full px-4 text-xs tracking-[0.16em] uppercase data-[state=active]:bg-background"
                  >
                    Volume
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="consistency" className="mt-0 min-h-[300px]">
                <ConsistencyHeatmap />
              </TabsContent>
              <TabsContent value="volume" className="mt-0 min-h-[300px]">
                <ActivityBar />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="rounded-[28px]">
          <CardHeader className="gap-3 border-b border-border/70 pb-4">
            <CardTitle className="text-xl tracking-tight">Breakdown</CardTitle>
            <CardDescription>
              Solved and unsolved, by difficulty and by pattern.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-5">
            <div className="space-y-4">
              {difficultyRows.map(({ key, solved, total }) => {
                const accent = difficultyAccent[key]
                const percentage = total > 0 ? (solved / total) * 100 : 0

                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2.5 w-2.5 rounded-full", accent.glow)} />
                        <span className={cn("font-semibold", accent.text)}>{accent.label}</span>
                      </div>
                      <span className="tabular-nums text-foreground/90">
                        {solved}
                        <span className="text-muted-foreground"> / {total || 0}</span>
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted/70">
                      <div
                        className={cn("h-full rounded-full bg-gradient-to-r", accent.bar)}
                        style={{ width: `${percentage.toFixed(1)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InventoryCard
                label="Attempted backlog"
                value={attemptedBacklog}
                detail="Started but never solved."
              />
              <InventoryCard
                label="Unseen pool"
                value={unseenCount}
                detail="Never opened."
              />
              <InventoryCard
                label="Top mistake"
                value={topMistake?.label ?? "None"}
                detail={topMistake ? `${topMistake.count} logged instances` : "No attempt mistakes logged yet."}
              />
              <InventoryCard
                label="Top pattern"
                value={topPattern?.label ?? "None"}
                detail={topPattern ? `${topPattern.count} solved problems tagged` : "Tag problems with a pattern to see this."}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <MistakesChart />
        <PatternBreakdown />
      </section>
    </div>
  )
}

function MetricChip({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/50 p-3.5 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
        </div>
        <Icon className="mt-0.5 h-4 w-4 text-primary/70" />
      </div>
    </div>
  )
}

function MiniStat({
  label,
  value,
  caption,
}: {
  label: string
  value: number
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

function ReviewStat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "warning" | "calm" | "neutral"
}) {
  const toneClass =
    tone === "warning"
      ? "border-orange-400/25 bg-orange-400/[0.12] text-orange-700 dark:text-orange-200"
      : tone === "calm"
        ? "border-emerald-400/25 bg-emerald-400/[0.12] text-emerald-700 dark:text-emerald-200"
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

function InsightRow({
  label,
  value,
  caption,
}: {
  label: string
  value: string
  caption: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
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

function AnalyticsTile({
  icon: Icon,
  label,
  value,
  caption,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string | number
  caption: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/[0.35] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
        </div>
        <Icon className="h-4 w-4 text-primary" />
      </div>
    </div>
  )
}

function InventoryCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string | number
  detail: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 line-clamp-1 text-lg font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  )
}

function parseTopEntry(
  raw: string | null,
  formatLabel?: (value: string) => string,
) {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Record<string, number>
    const entries = Object.entries(parsed).sort((a, b) => b[1] - a[1])
    const top = entries[0]
    if (!top) return null

    return {
      label: formatLabel ? formatLabel(top[0]) : top[0],
      count: top[1],
    }
  } catch {
    return null
  }
}

function formatBreakdownLabel(label: string) {
  return label
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}
