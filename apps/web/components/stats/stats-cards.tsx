"use client"

import { CheckCircle2, Flame, Sun, Trophy, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserStats } from "@/hooks/use-stats"

export function StatsCards() {
  const { data: s, isLoading } = useUserStats()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[106px] w-full" />
        ))}
      </div>
    )
  }

  if (!s) return null

  const totalSolved =
    s.totalSolved + s.totalSolvedWithHelp + s.totalMastered

  const cards = [
    {
      title: "Total Solved",
      value: totalSolved,
      icon: CheckCircle2,
      sub: `${s.easySolved}E · ${s.mediumSolved}M · ${s.hardSolved}H`,
      color: "text-green-500",
    },
    {
      title: "Current Streak",
      value: `${s.currentStreak}d`,
      icon: Flame,
      sub: `Longest: ${s.longestStreak} days`,
      color: "text-orange-500",
    },
    {
      title: "This Week",
      value: s.solvedThisWeek,
      icon: Sun,
      sub: `${s.solvedThisMonth} this month`,
      color: "text-sky-500",
    },
    {
      title: "This Month",
      value: s.solvedThisMonth,
      icon: Zap,
      sub: `${s.solvedThisWeek} this week`,
      color: "text-blue-500",
    },
    {
      title: "Mastered",
      value: s.totalMastered,
      icon: Trophy,
      sub: `${s.firstAttemptSolves} first-try solves`,
      color: "text-yellow-500",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
