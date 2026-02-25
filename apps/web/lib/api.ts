import type {
  AttemptDto,
  CreateListRequest,
  CreateNoteRequest,
  DailyStatDto,
  Language,
  LogAttemptRequest,
  NoteDto,
  NoteFilters,
  PagedResponse,
  PatternDto,
  ProblemDetailDto,
  ProblemFilters,
  ProblemListDto,
  ProblemSummaryDto,
  ThemeDto,
  TopicDto,
  UpdateAttemptRequest,
  UpdateNoteRequest,
  UpdateProfileRequest,
  UserProfileDto,
  UserSettingsDto,
  UserStatsDto,
} from "./types"

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export async function apiFetch<T>(
  path: string,
  token: string | undefined,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// ─── Problems ────────────────────────────────────────────────────────────────

export function getProblems(
  token: string | undefined,
  filters?: ProblemFilters,
): Promise<PagedResponse<ProblemSummaryDto>> {
  const params = new URLSearchParams()
  if (filters?.difficulty) params.set("difficulty", filters.difficulty)
  if (filters?.status) params.set("status", filters.status)
  if (filters?.topicId) params.set("topicId", String(filters.topicId))
  if (filters?.patternId) params.set("patternId", String(filters.patternId))
  if (filters?.search) params.set("search", filters.search)
  if (filters?.page != null) params.set("page", String(filters.page))
  if (filters?.size != null) params.set("size", String(filters.size))
  if (filters?.sort) params.set("sort", filters.sort)
  const qs = params.toString()
  return apiFetch(`/api/problems${qs ? `?${qs}` : ""}`, token)
}

export function getProblem(
  token: string | undefined,
  id: number,
): Promise<ProblemDetailDto> {
  return apiFetch(`/api/problems/${id}`, token)
}

// ─── Topics & Patterns ────────────────────────────────────────────────────────

export function getTopics(token: string | undefined): Promise<TopicDto[]> {
  return apiFetch("/api/topics", token)
}

export function getPatterns(token: string | undefined): Promise<PatternDto[]> {
  return apiFetch("/api/patterns", token)
}

// ─── Attempts ────────────────────────────────────────────────────────────────

export function getAttempts(
  token: string | undefined,
  problemId: number,
): Promise<AttemptDto[]> {
  return apiFetch(`/api/problems/${problemId}/attempts`, token)
}

export function logAttempt(
  token: string | undefined,
  problemId: number,
  body: LogAttemptRequest,
): Promise<AttemptDto> {
  return apiFetch(`/api/problems/${problemId}/attempts`, token, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function updateAttempt(
  token: string | undefined,
  problemId: number,
  attemptId: number,
  body: UpdateAttemptRequest,
): Promise<AttemptDto> {
  return apiFetch(`/api/problems/${problemId}/attempts/${attemptId}`, token, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export function deleteAttempt(
  token: string | undefined,
  problemId: number,
  attemptId: number,
): Promise<void> {
  return apiFetch(`/api/problems/${problemId}/attempts/${attemptId}`, token, {
    method: "DELETE",
  })
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function getUserStats(token: string | undefined): Promise<UserStatsDto> {
  return apiFetch("/api/me/stats", token)
}

export function getDailyStats(
  token: string | undefined,
  days?: number,
): Promise<DailyStatDto[]> {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - (days ?? 365))
  const fmt = (d: Date) => d.toISOString().split("T")[0]
  return apiFetch(`/api/me/stats/daily?from=${fmt(from)}&to=${fmt(to)}`, token)
}

// ─── Problem Lists ────────────────────────────────────────────────────────────

export function getProblemLists(
  token: string | undefined,
): Promise<ProblemListDto[]> {
  return apiFetch("/api/me/lists", token)
}

export function getProblemList(
  token: string | undefined,
  id: number,
): Promise<ProblemListDto> {
  return apiFetch(`/api/me/lists/${id}`, token)
}

export function createProblemList(
  token: string | undefined,
  body: CreateListRequest,
): Promise<ProblemListDto> {
  return apiFetch("/api/me/lists", token, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function deleteProblemList(
  token: string | undefined,
  id: number,
): Promise<void> {
  return apiFetch(`/api/me/lists/${id}`, token, { method: "DELETE" })
}

export function addProblemToList(
  token: string | undefined,
  listId: number,
  problemId: number,
): Promise<void> {
  return apiFetch(`/api/me/lists/${listId}/problems/${problemId}`, token, {
    method: "POST",
  })
}

export function removeProblemFromList(
  token: string | undefined,
  listId: number,
  problemId: number,
): Promise<void> {
  return apiFetch(`/api/me/lists/${listId}/problems/${problemId}`, token, {
    method: "DELETE",
  })
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export function getNotes(
  token: string | undefined,
  filters?: NoteFilters,
): Promise<PagedResponse<NoteDto>> {
  const params = new URLSearchParams()
  if (filters?.tag) params.set("tag", filters.tag)
  if (filters?.problemId) params.set("problemId", String(filters.problemId))
  if (filters?.search) params.set("search", filters.search)
  if (filters?.page != null) params.set("page", String(filters.page))
  if (filters?.size != null) params.set("size", String(filters.size))
  const qs = params.toString()
  return apiFetch(`/api/notes${qs ? `?${qs}` : ""}`, token)
}

export function getNote(
  token: string | undefined,
  id: number,
): Promise<NoteDto> {
  return apiFetch(`/api/notes/${id}`, token)
}

export function createNote(
  token: string | undefined,
  body: CreateNoteRequest,
): Promise<NoteDto> {
  return apiFetch("/api/notes", token, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function updateNote(
  token: string | undefined,
  id: number,
  body: UpdateNoteRequest,
): Promise<NoteDto> {
  return apiFetch(`/api/notes/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export function deleteNote(
  token: string | undefined,
  id: number,
): Promise<void> {
  return apiFetch(`/api/notes/${id}`, token, { method: "DELETE" })
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function getUserSettings(
  token: string | undefined,
): Promise<UserSettingsDto> {
  return apiFetch("/api/me/settings", token)
}

export function updateUserLanguage(
  token: string | undefined,
  language: Language,
): Promise<UserSettingsDto> {
  return apiFetch("/api/me/settings/language", token, {
    method: "PATCH",
    body: JSON.stringify({ language }),
  })
}

export function updateUserDailyGoal(
  token: string | undefined,
  dailyGoal: number,
): Promise<UserSettingsDto> {
  return apiFetch("/api/me/settings/daily-goal", token, {
    method: "PATCH",
    body: JSON.stringify({ dailyGoal }),
  })
}

export function updateUserTimezone(
  token: string | undefined,
  timezone: string,
): Promise<UserSettingsDto> {
  return apiFetch("/api/me/settings/timezone", token, {
    method: "PATCH",
    body: JSON.stringify({ timezone }),
  })
}

export function updateUserTheme(
  token: string | undefined,
  themeId: number | null,
): Promise<UserSettingsDto> {
  return apiFetch("/api/me/settings/theme", token, {
    method: "PATCH",
    body: JSON.stringify({ themeId }),
  })
}


export function getThemes(token: string | undefined): Promise<ThemeDto[]> {
  return apiFetch("/api/themes", token)
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function getUserProfile(token: string | undefined): Promise<UserProfileDto> {
  return apiFetch("/api/me/profile", token)
}

export function updateUserProfile(
  token: string | undefined,
  body: UpdateProfileRequest,
): Promise<UserProfileDto> {
  return apiFetch("/api/me/profile", token, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}
