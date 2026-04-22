import { format } from "date-fns"
import type { NoteTag } from "@/lib/types"

export const NOTE_TAG_COLORS: Record<NoteTag, string> = {
  GENERAL: "bg-gray-100 text-gray-700",
  INTERVIEW: "bg-blue-100 text-blue-700",
  LEARNING: "bg-green-100 text-green-700",
  REVIEW: "bg-orange-100 text-orange-700",
  STRATEGY: "bg-purple-100 text-purple-700",
}

export const NOTE_TAGS: { value: NoteTag; label: string }[] = [
  { value: "GENERAL", label: "General" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "LEARNING", label: "Learning" },
  { value: "REVIEW", label: "Review" },
  { value: "STRATEGY", label: "Strategy" },
]

export function formatNoteDate(value: string) {
  return format(new Date(value), "MMM d, yyyy")
}

export function normalizeReturnTo(value: string | null | undefined) {
  if (!value) return undefined
  return /^\/(?!\/)/.test(value) ? value : undefined
}

export function getNoteHref(noteId: number, returnTo?: string) {
  const params = new URLSearchParams()
  const normalizedReturnTo = normalizeReturnTo(returnTo)
  if (normalizedReturnTo) params.set("returnTo", normalizedReturnTo)
  const qs = params.toString()
  return `/notes/${noteId}${qs ? `?${qs}` : ""}`
}

export function getNoteEditHref(noteId: number, returnTo?: string) {
  const params = new URLSearchParams({ edit: "1" })
  const normalizedReturnTo = normalizeReturnTo(returnTo)
  if (normalizedReturnTo) params.set("returnTo", normalizedReturnTo)
  return `/notes/${noteId}?${params.toString()}`
}

export function getNewNoteHref(options?: {
  problemId?: number
  title?: string
  returnTo?: string
}) {
  const params = new URLSearchParams()
  if (options?.problemId != null) params.set("problemId", String(options.problemId))
  if (options?.title) params.set("title", options.title)
  const normalizedReturnTo = normalizeReturnTo(options?.returnTo)
  if (normalizedReturnTo) params.set("returnTo", normalizedReturnTo)
  const qs = params.toString()
  return `/notes/new${qs ? `?${qs}` : ""}`
}
