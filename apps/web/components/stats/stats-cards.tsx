"use client"

import { CheckCircle2, CircleDashed, Flame, Sun, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserStats } from "@/hooks/use-stats"
import { useProblems } from "@/hooks/use-problems"

export function StatsCards() {
  const { data: stats, isLoading } = useUserStats()
  const { data: problemsPage, isLoading: isLoadingProblems } = useProblems({ page: 0, size: 1 })

  if (isLoading || isLoadingProblems || !stats) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[132px] w-full" />
        ))}
      </div>
    )
  }

  const totalSolved = stats.totalSolved + stats.totalSolvedWithHelp + stats.totalMastered
  const totalProblems = problemsPage?.totalElements ?? totalSolved
  const totalUnsolved = Math.max(totalProblems - totalSolved, 0)

  const cards = [
    {
      title: "Total Solved",
      value: totalSolved,
      icon: CheckCircle2,
      sub: `${stats.easySolved}E / ${stats.mediumSolved}M / ${stats.hardSolved}H`,
      color: "text-green-500",
    },
    {
      title: "Unsolved",
      value: totalUnsolved,
      icon: CircleDashed,
      sub: `${totalProblems} total problems`,
      color: "text-slate-400",
    },
    {
      title: "Current Streak",
      value: `${stats.currentStreak}d`,
      icon: Flame,
      sub: `Longest: ${stats.longestStreak} days`,
      color: "text-orange-500",
    },
    {
      title: "This Week",
      value: stats.solvedThisWeek,
      icon: Sun,
      sub: `${stats.solvedThisMonth} this month`,
      color: "text-sky-500",
    },
    {
      title: "Mastered",
      value: stats.totalMastered,
      icon: Trophy,
      sub: `${stats.firstAttemptSolves} first-try solves`,
      color: "text-yellow-500",
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ title, value, icon: Icon, sub, color }) => (
        <Card key={title} className="overflow-hidden py-0">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {title}
                </p>
                <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/70">
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
            <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">{sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
