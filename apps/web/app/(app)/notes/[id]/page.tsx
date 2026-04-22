"use client"

import { use } from "react"
import { useSearchParams } from "next/navigation"
import { NoteEditorPage } from "@/components/notes/note-editor-page"
import { normalizeReturnTo } from "@/lib/note-display"

export default function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: rawId } = use(params)
  const searchParams = useSearchParams()
  const noteId = Number(rawId)
  const returnTo = normalizeReturnTo(searchParams.get("returnTo"))
  const initialMode = searchParams.get("edit") === "1" ? "edit" : "view"

  return (
    <NoteEditorPage
      noteId={Number.isFinite(noteId) && noteId > 0 ? noteId : 0}
      initialMode={initialMode}
      returnTo={returnTo}
    />
  )
}
