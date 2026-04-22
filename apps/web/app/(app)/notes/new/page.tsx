"use client"

import { useSearchParams } from "next/navigation"
import { NoteEditorPage } from "@/components/notes/note-editor-page"
import { normalizeReturnTo } from "@/lib/note-display"

export default function NewNotePage() {
  const searchParams = useSearchParams()
  const problemId = Number(searchParams.get("problemId"))
  const defaultTitle = searchParams.get("title") ?? undefined
  const returnTo = normalizeReturnTo(searchParams.get("returnTo"))

  return (
    <NoteEditorPage
      initialProblemId={Number.isFinite(problemId) && problemId > 0 ? problemId : undefined}
      defaultTitle={defaultTitle}
      initialMode="edit"
      returnTo={returnTo}
    />
  )
}
