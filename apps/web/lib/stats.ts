import { format, isSameMonth, parseISO, startOfWeek, subDays } from "date-fns"
import type { DailyStatDto, Difficulty, ProblemStatus, ProblemSummaryDto, UserStatsDto } from "@/lib/types"

export const EMPTY_USER_STATS: UserStatsDto = {
  id: 0,
  totalSolved: 0,
  totalSolvedWithHelp: 0,
  totalMastered: 0,
  totalAttempted: 0,
  easySolved: 0,
  mediumSolved: 0,
  hardSolved: 0,
  totalAttempts: 0,
  firstAttemptSolves: 0,
  totalTimeMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastSolvedDate: null,
  solvedThisWeek: 0,
  solvedThisMonth: 0,
  distinctTopicsCovered: 0,
  distinctPatternsCovered: 0,
  mistakeBreakdown: null,
  patternBreakdown: null,
}

const SOLVED_STATUSES: ProblemStatus[] = ["SOLVED", "SOLVED_WITH_HELP", "MASTERED"]

export function isSolvedStatus(status: ProblemStatus) {
  return SOLVED_STATUSES.includes(status)
}

export interface ListStats {
  total: number
  completed: number
  remaining: number
  mastered: number
  attempted: number
  unseen: number
  solvedWithHelp: number
  solved: number
  completionRate: number
  byDifficulty: Record<Difficulty, number>
}

export function getListStats(problems: ProblemSummaryDto[] | undefined): ListStats {
  const stats: ListStats = {
    total: 0,
    completed: 0,
    remaining: 0,
    mastered: 0,
    attempted: 0,
    unseen: 0,
    solvedWithHelp: 0,
    solved: 0,
    completionRate: 0,
    byDifficulty: {
      EASY: 0,
      MEDIUM: 0,
      HARD: 0,
    },
  }

  for (const problem of problems ?? []) {
    stats.total += 1
    stats.byDifficulty[problem.difficulty] += 1

    switch (problem.status) {
      case "MASTERED":
        stats.mastered += 1
        stats.completed += 1
        break
      case "SOLVED":
        stats.solved += 1
        stats.completed += 1
        break
      case "SOLVED_WITH_HELP":
        stats.solvedWithHelp += 1
        stats.completed += 1
        break
      case "ATTEMPTED":
        stats.attempted += 1
        stats.remaining += 1
        break
      case "UNSEEN":
        stats.unseen += 1
        stats.remaining += 1
        break
    }
  }

  stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return stats
}

export function getSolvedCountByDifficulty(
  problems: ProblemSummaryDto[] | undefined,
  difficulty: Difficulty,
) {
  return (problems ?? []).filter(
    (problem) => problem.difficulty === difficulty && isSolvedStatus(problem.status)
  ).length
}

export function getTotalSolvedCount(problems: ProblemSummaryDto[] | undefined) {
  return (problems ?? []).filter((problem) => isSolvedStatus(problem.status)).length
}

export function getMasteredCount(problems: ProblemSummaryDto[] | undefined) {
  return (problems ?? []).filter((problem) => problem.status === "MASTERED").length
}

export function getFirstAttemptSolveCount(stats: UserStatsDto | undefined) {
  return stats?.firstAttemptSolves ?? 0
}

export function getCurrentStreak(dailyStats: DailyStatDto[] | undefined) {
  if (!dailyStats?.length) return 0

  const solvedDates = new Set(
    dailyStats.filter((stat) => stat.solved > 0).map((stat) => stat.date)
  )
  if (solvedDates.size === 0) return 0

  let streak = 0
  let cursor = new Date()

  while (true) {
    const dateKey = format(cursor, "yyyy-MM-dd")
    if (!solvedDates.has(dateKey)) {
      if (streak === 0) {
        cursor = subDays(cursor, 1)
        const previousDateKey = format(cursor, "yyyy-MM-dd")
        if (!solvedDates.has(previousDateKey)) return 0
      } else {
        return streak
      }
    } else {
      streak += 1
      cursor = subDays(cursor, 1)
    }
  }
}

export function getLongestStreak(dailyStats: DailyStatDto[] | undefined) {
  if (!dailyStats?.length) return 0

  const solvedDates = dailyStats
    .filter((stat) => stat.solved > 0)
    .map((stat) => stat.date)
    .sort()

  let longest = 0
  let current = 0
  let previous: Date | null = null

  for (const value of solvedDates) {
    const currentDate = parseISO(value)
    if (!previous) {
      current = 1
    } else {
      const previousPlusOne = format(subDays(currentDate, 1), "yyyy-MM-dd")
      current = format(previous, "yyyy-MM-dd") === previousPlusOne
        ? current + 1
        : 1
    }
    longest = Math.max(longest, current)
    previous = currentDate
  }

  return longest
}

export function getSolvedThisWeek(dailyStats: DailyStatDto[] | undefined) {
  if (!dailyStats?.length) return 0
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  return dailyStats.reduce((total, stat) => {
    const date = parseISO(stat.date)
    return date >= weekStart ? total + stat.solved : total
  }, 0)
}

export function getSolvedThisMonth(dailyStats: DailyStatDto[] | undefined) {
  if (!dailyStats?.length) return 0
  const now = new Date()
  return dailyStats.reduce((total, stat) => {
    const date = parseISO(stat.date)
    return isSameMonth(date, now) ? total + stat.solved : total
  }, 0)
}
