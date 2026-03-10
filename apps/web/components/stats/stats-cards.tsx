"use client"

import { CheckCircle2, Flame, Sun, Trophy, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useProblems } from "@/hooks/use-problems"
import { useUserStats } from "@/hooks/use-stats"
import { useDailyStats } from "@/hooks/use-stats"
import {
  getCurrentStreak,
  getFirstAttemptSolveCount,
  getLongestStreak,
  getMasteredCount,
  getSolvedThisMonth,
  getSolvedThisWeek,
  getSolvedCountByDifficulty,
  getTotalSolvedCount,
} from "@/lib/stats"

export function StatsCards() {
  const { data: problemPage, isLoading: problemsLoading } = useProblems({ size: 1000 })
  const { data: dailyStats, isLoading: dailyStatsLoading } = useDailyStats(365)
  const { data: stats } = useUserStats()

  if (problemsLoading || dailyStatsLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[106px] w-full" />
        ))}
      </div>
    )
  }

  const problems = problemPage?.content ?? []
  const totalSolved = getTotalSolvedCount(problems)
  const currentStreak = getCurrentStreak(dailyStats)
  const longestStreak = getLongestStreak(dailyStats)
  const solvedThisWeek = getSolvedThisWeek(dailyStats)
  const solvedThisMonth = getSolvedThisMonth(dailyStats)
  const masteredCount = getMasteredCount(problems)
  const firstAttemptSolves = getFirstAttemptSolveCount(stats)

  const cards = [
    {
      title: "Total Solved",
      value: totalSolved,
      icon: CheckCircle2,
      sub: `${getSolvedCountByDifficulty(problems, "EASY")}E · ${getSolvedCountByDifficulty(problems, "MEDIUM")}M · ${getSolvedCountByDifficulty(problems, "HARD")}H`,
      color: "text-green-500",
    },
    {
      title: "Current Streak",
      value: `${currentStreak}d`,
      icon: Flame,
      sub: `Longest: ${longestStreak} days`,
      color: "text-orange-500",
    },
    {
      title: "This Week",
      value: solvedThisWeek,
      icon: Sun,
      sub: `${solvedThisMonth} this month`,
      color: "text-sky-500",
    },
    {
      title: "This Month",
      value: solvedThisMonth,
      icon: Zap,
      sub: `${solvedThisWeek} this week`,
      color: "text-blue-500",
    },
    {
      title: "Mastered",
      value: masteredCount,
      icon: Trophy,
      sub: `${firstAttemptSolves} first-try solves`,
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
