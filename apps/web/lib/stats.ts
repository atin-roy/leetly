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
}

const SOLVED_STATUSES: ProblemStatus[] = ["SOLVED", "SOLVED_WITH_HELP", "MASTERED"]

function isSolvedStatus(status: ProblemStatus) {
  return SOLVED_STATUSES.includes(status)
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
