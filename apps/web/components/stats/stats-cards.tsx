"use client"

import { CheckCircle2, Flame, Target, Trophy, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserStats } from "@/hooks/use-stats"

export function StatsCards() {
  const { data: stats, isLoading } = useUserStats()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-1 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const cards = [
    {
      title: "Total Solved",
      value: stats.totalSolved,
      icon: CheckCircle2,
      sub: `${stats.easySolved} easy · ${stats.mediumSolved} medium · ${stats.hardSolved} hard`,
      color: "text-green-500",
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
      icon: Zap,
      sub: `${stats.solvedThisMonth} this month`,
      color: "text-blue-500",
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ title, value, icon: Icon, sub, color }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function ProgressCard() {
  const { data: stats, isLoading } = useUserStats()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const total = stats.totalSolved + stats.totalSolvedWithHelp
  const goals = [
    { label: "Easy", solved: stats.easySolved, total: 800, color: "bg-green-500" },
    { label: "Medium", solved: stats.mediumSolved, total: 1600, color: "bg-yellow-500" },
    { label: "Hard", solved: stats.hardSolved, total: 700, color: "bg-red-500" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Difficulty Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {goals.map(({ label, solved, total, color }) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium">{label}</span>
              <span className="text-muted-foreground">{solved}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${color}`}
                style={{ width: `${Math.min((solved / total) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
