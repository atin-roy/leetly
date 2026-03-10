import type { UserStatsDto } from "@/lib/types"

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
