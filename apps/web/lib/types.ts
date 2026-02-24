// ─── Enums ────────────────────────────────────────────────────────────────────

export type Difficulty = "EASY" | "MEDIUM" | "HARD"

export type ProblemStatus =
  | "UNSEEN"
  | "ATTEMPTED"
  | "SOLVED_WITH_HELP"
  | "SOLVED"
  | "MASTERED"

export type Language =
  | "JAVA"
  | "PYTHON"
  | "JAVASCRIPT"
  | "TYPESCRIPT"
  | "CPP"
  | "C"
  | "GO"
  | "RUST"
  | "KOTLIN"
  | "SWIFT"

export type Outcome =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "MEMORY_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "NOT_COMPLETED"

export type NoteTag =
  | "GENERAL"
  | "INTERVIEW"
  | "LEARNING"
  | "REVIEW"
  | "STRATEGY"

// ─── Paginated Response ───────────────────────────────────────────────────────

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// ─── Problem Domain ───────────────────────────────────────────────────────────

export interface TopicDto {
  id: number
  name: string
  description: string
}

export interface PatternDto {
  id: number
  name: string
  description: string
  topicId: number | null
  topicName: string | null
  namedAlgorithm: boolean
}

export interface Mistake {
  id: number
  type: string
  description: string
}

export interface AttemptDto {
  id: number
  problemId: number
  attemptNumber: number
  language: Language
  code: string
  outcome: Outcome
  durationMinutes: number | null
  mistakes: Mistake[]
  timeComplexity: string | null
  spaceComplexity: string | null
  aiReview: string | null
  learned: string | null
  takeaways: string | null
  notes: string | null
  createdDate: string // ISO datetime
}

export interface ProblemSummaryDto {
  id: number
  leetcodeId: number
  title: string
  url: string
  difficulty: Difficulty
  status: ProblemStatus
}

export interface ProblemDetailDto {
  id: number
  leetcodeId: number
  title: string
  url: string
  difficulty: Difficulty
  status: ProblemStatus
  topics: TopicDto[]
  patterns: PatternDto[]
  relatedProblems: ProblemSummaryDto[]
  attempts: AttemptDto[]
}

// ─── Note Domain ──────────────────────────────────────────────────────────────

export interface NoteDto {
  id: number
  problemId: number | null
  dateTime: string // ISO datetime
  tag: NoteTag
  title: string
  content: string
}

// ─── User Domain ──────────────────────────────────────────────────────────────

export interface UserStatsDto {
  id: number
  totalSolved: number
  totalSolvedWithHelp: number
  totalMastered: number
  totalAttempted: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
  totalAttempts: number
  firstAttemptSolves: number
  totalTimeMinutes: number
  currentStreak: number
  longestStreak: number
  lastSolvedDate: string | null // ISO date
  solvedThisWeek: number
  solvedThisMonth: number
  distinctTopicsCovered: number
  distinctPatternsCovered: number
  mistakeBreakdown: string | null // JSON string
}

export interface DailyStatDto {
  id: number
  date: string // ISO date
  solved: number
  attempted: number
  timeMinutes: number
}

export interface UserSettingsDto {
  preferredLanguage: Language
  dailyGoal: number
  timezone: string
  themeId: number | null
  themeName: string | null
}

export interface ThemeDto {
  id: number
  name: string
  properties: string // JSON string
}

export interface ProblemListDto {
  id: number
  name: string
  isDefault: boolean
  problems: ProblemSummaryDto[]
}

// ─── Request Types ────────────────────────────────────────────────────────────

export interface LogAttemptRequest {
  language: Language
  code: string
  outcome: Outcome
  durationMinutes?: number
  timeComplexity?: string
  spaceComplexity?: string
  learned?: string
  takeaways?: string
  notes?: string
}

export interface UpdateAttemptRequest {
  language?: Language
  code?: string
  outcome?: Outcome
  durationMinutes?: number
  timeComplexity?: string
  spaceComplexity?: string
  learned?: string
  takeaways?: string
  notes?: string
}

export interface CreateNoteRequest {
  problemId?: number
  tag: NoteTag
  title: string
  content: string
}

export interface UpdateNoteRequest {
  tag?: NoteTag
  title?: string
  content?: string
}

export interface CreateListRequest {
  name: string
}

export interface UpdateSettingsRequest {
  preferredLanguage?: Language
  dailyGoal?: number
  timezone?: string
  themeId?: number
}

export interface UserProfileDto {
  displayName: string | null
  bio: string | null
  progressPublic: boolean
  streakPublic: boolean
  listsPublic: boolean
  notesPublic: boolean
}

export interface UpdateProfileRequest {
  displayName: string | null
  bio: string | null
  progressPublic: boolean
  streakPublic: boolean
  listsPublic: boolean
  notesPublic: boolean
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface ProblemFilters {
  difficulty?: Difficulty
  status?: ProblemStatus
  topicId?: number
  patternId?: number
  search?: string
  page?: number
  size?: number
  sort?: string
}

export interface NoteFilters {
  tag?: NoteTag
  problemId?: number
  search?: string
  page?: number
  size?: number
}
