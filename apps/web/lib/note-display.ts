import { format } from "date-fns"
import tone from "@/components/ui/tone.module.css"
import { cn } from "@/lib/utils"
import type { NoteTag } from "@/lib/types"

/*
 * Theme-derived, not fixed palette classes. These used to be light-mode chips
 * (bg-gray-100 text-gray-700) that rendered as pale pills on the dark themes.
 * See components/ui/tone.module.css for how the tones adapt.
 */
export const NOTE_TAG_COLORS: Record<NoteTag, string> = {
  GENERAL: cn(tone.tone, tone.neutral),
  INTERVIEW: cn(tone.tone, tone.blue),
  LEARNING: cn(tone.tone, tone.green),
  REVIEW: cn(tone.tone, tone.amber),
  STRATEGY: cn(tone.tone, tone.violet),
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
