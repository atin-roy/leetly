"use client"

import { CheckCircle2, Flame, Sun, Trophy, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// TODO: replace with real data from useUserStats()
const DUMMY = {
  totalSolved: 127,
  easySolved: 54,
  mediumSolved: 58,
  hardSolved: 15,
  currentStreak: 7,
  longestStreak: 23,
  solvedToday: 3,
  solvedThisWeek: 8,
  solvedThisMonth: 31,
  totalMastered: 43,
  firstAttemptSolves: 28,
}

export function StatsCards() {
  const s = DUMMY
  const cards = [
    {
      title: "Total Solved",
      value: s.totalSolved,
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
      title: "Solved Today",
      value: s.solvedToday,
      icon: Sun,
      sub: `${s.solvedThisWeek} this week`,
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
