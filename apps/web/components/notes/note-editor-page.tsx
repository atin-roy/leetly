"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarkdownContent } from "@/components/ui/markdown-content"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useNote, useCreateNote, useDeleteNote, useUpdateNote } from "@/hooks/use-notes"
import { useProblem } from "@/hooks/use-problems"
import {
  formatNoteDate,
  getNoteHref,
  normalizeReturnTo,
  NOTE_TAG_COLORS,
  NOTE_TAGS,
} from "@/lib/note-display"
import { cn } from "@/lib/utils"
import type { NoteTag } from "@/lib/types"
import styles from "./note-editor-page.module.css"

type Mode = "view" | "edit"

interface Props {
  noteId?: number
  initialProblemId?: number
  defaultTitle?: string
  initialMode?: Mode
  returnTo?: string
}

export function NoteEditorPage({
  noteId,
  initialProblemId,
  defaultTitle,
  initialMode = noteId ? "view" : "edit",
  returnTo,
}: Props) {
  const normalizedReturnTo = normalizeReturnTo(returnTo)
  const { data: note, isLoading: isNoteLoading } = useNote(noteId ?? 0)
  const problemId = note?.problemId ?? initialProblemId ?? 0
  const { data: problem, isLoading: isProblemLoading } = useProblem(problemId)

  const backHref = useMemo(() => {
    if (normalizedReturnTo) return normalizedReturnTo
    if (note?.problemId) return `/problems/${note.problemId}`
    if (initialProblemId) return `/problems/${initialProblemId}`
    return "/notes"
  }, [initialProblemId, normalizedReturnTo, note?.problemId])

  const pageTitle = note ? note.title : "New Note"
  const pageDescription = note
    ? "Keep this note as a durable page instead of a transient modal."
    : "Write the note once, keep the URL, and come back to it later."

  if (noteId && isNoteLoading) {
    return (
      <div className={styles.skeletons}>
        <Skeleton className={styles.skeletonBack} />
        <Skeleton className={styles.skeletonTitle} />
        <Skeleton className={styles.skeletonBody} />
      </div>
    )
  }

  if (noteId && !isNoteLoading && !note) {
    return (
      <div className={styles.page}>
        <Button variant="ghost" size="sm" asChild className={styles.back}>
          <Link href={backHref}>
            <ArrowLeft size={16} />
            Back
          </Link>
        </Button>
        <div className={styles.notFound}>Note not found.</div>
      </div>
    )
  }

  return (
    <NoteEditorPageBody
      key={note ? `note-${note.id}-${initialMode}` : `new-${initialProblemId ?? 0}-${defaultTitle ?? ""}-${initialMode}`}
      note={note}
      initialProblemId={initialProblemId}
      initialMode={initialMode}
      defaultTitle={defaultTitle}
      normalizedReturnTo={normalizedReturnTo}
      backHref={backHref}
      pageTitle={pageTitle}
      pageDescription={pageDescription}
      problem={problem ? { id: problem.id, title: problem.title } : null}
      isProblemLoading={isProblemLoading}
      problemId={problemId}
    />
  )
}

function NoteEditorPageBody({
  note,
  initialProblemId,
  initialMode,
  defaultTitle,
  normalizedReturnTo,
  backHref,
  pageTitle,
  pageDescription,
  problem,
  isProblemLoading,
  problemId,
}: {
  note?: {
    id: number
    problemId: number | null
    dateTime: string
    tag: NoteTag
    title: string
    content: string
  }
  initialProblemId?: number
  initialMode: Mode
  defaultTitle?: string
  normalizedReturnTo?: string
  backHref: string
  pageTitle: string
  pageDescription: string
  problem: { id: number; title: string } | null
  isProblemLoading: boolean
  problemId: number
}) {
  const router = useRouter()
  const createNoteMutation = useCreateNote()
  const updateNoteMutation = useUpdateNote()
  const deleteNoteMutation = useDeleteNote()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [tag, setTag] = useState<NoteTag>(note?.tag ?? "GENERAL")
  const [title, setTitle] = useState(note?.title ?? defaultTitle ?? "")
  const [content, setContent] = useState(note?.content ?? "")
  const [showPreview, setShowPreview] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function handleSave() {
    if (!title.trim() || !content.trim()) return

    try {
      if (note) {
        await updateNoteMutation.mutateAsync({
          id: note.id,
          body: { tag, title, content },
        })
        toast.success("Note updated")
        setMode("view")
        return
      }

      const created = await createNoteMutation.mutateAsync({
        problemId: initialProblemId || undefined,
        tag,
        title,
        content,
      })
      toast.success("Note created")
      router.replace(getNoteHref(created.id, normalizedReturnTo))
    } catch {
      toast.error(note ? "Failed to update note" : "Failed to create note")
    }
  }

  async function handleDelete() {
    if (!note) return

    try {
      await deleteNoteMutation.mutateAsync(note.id)
      toast.success("Note deleted")
      router.replace(backHref)
    } catch {
      toast.error("Failed to delete note")
    }
  }

  return (
    <div className={styles.page}>
      <Button variant="ghost" size="sm" asChild className={styles.back}>
        <Link href={backHref}>
          <ArrowLeft size={16} />
          Back
        </Link>
      </Button>

      <div className={styles.head}>
        <div className={styles.headText}>
          <div className={styles.meta}>
            <Badge variant="secondary" className={NOTE_TAG_COLORS[tag]}>
              {tag}
            </Badge>
            {note?.dateTime ? (
              <span className={styles.metaNote}>{formatNoteDate(note.dateTime)}</span>
            ) : null}
            {problemId ? (
              <span className={styles.metaNote}>
                {isProblemLoading
                  ? "Loading problem…"
                  : problem
                    ? `Problem: ${problem.title}`
                    : `Problem #${problemId}`}
              </span>
            ) : null}
          </div>
          <h1 className={styles.title}>{pageTitle}</h1>
          <p className={styles.subtitle}>{pageDescription}</p>
        </div>

        <div className={styles.headActions}>
          {note ? (
            <>
              {mode === "view" ? (
                <Button variant="outline" onClick={() => setMode("edit")}>
                  <Pencil size={16} />
                  Edit
                </Button>
              ) : null}
              <Button variant="outline" className={styles.danger} onClick={() => setDeleteOpen(true)}>
                <Trash2 size={16} />
                Delete
              </Button>
            </>
          ) : null}
          {mode === "edit" ? (
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                if (note) {
                  setTag(note.tag)
                  setTitle(note.title)
                  setContent(note.content)
                  setMode("view")
                  return
                }
                router.push(backHref)
              }}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </div>

      {mode === "view" ? (
        <section className={styles.panel}>
          <div className={styles.viewBody}>
            <MarkdownContent content={content} />
          </div>
        </section>
      ) : (
        <section className={styles.panel}>
          <div className={styles.editHead}>
            <div>
              <p className={styles.label}>{note ? "Edit note" : "Create note"}</p>
              <p className={styles.editHeadNote}>
                Markdown source on the left, preview on the right when you need it.
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowPreview((value) => !value)}>
              {showPreview ? (
                <>
                  <EyeOff size={16} />
                  Hide preview
                </>
              ) : (
                <>
                  <Eye size={16} />
                  Show preview
                </>
              )}
            </Button>
          </div>
          <div className={styles.editBody}>
            <div className={styles.fields}>
              <div className={styles.field}>
                <Label htmlFor="note-title" className={styles.label}>
                  Title
                </Label>
                <Input
                  id="note-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Note title..."
                />
              </div>
              <div className={styles.field}>
                <Label className={styles.label}>Tag</Label>
                <Select value={tag} onValueChange={(value) => setTag(value as NoteTag)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_TAGS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={cn(styles.editor, showPreview && styles.split)}>
              <div className={styles.field}>
                <Label htmlFor="note-content" className={styles.label}>
                  Markdown
                </Label>
                <Textarea
                  id="note-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Write your note in markdown..."
                  className={styles.textarea}
                />
              </div>
              {showPreview ? (
                <div className={styles.field}>
                  <Label className={styles.label}>Preview</Label>
                  <div className={styles.preview}>
                    {content.trim() ? (
                      <MarkdownContent content={content} />
                    ) : (
                      <p className={styles.previewEmpty}>Preview will appear here...</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className={styles.saveRow}>
              <Button
                type="button"
                onClick={handleSave}
                disabled={!title.trim() || !content.trim() || createNoteMutation.isPending || updateNoteMutation.isPending}
              >
                {note ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </section>
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={!deleteNoteMutation.isPending}>
          <DialogHeader>
            <DialogTitle>Delete note?</DialogTitle>
            <DialogDescription>
              {note
                ? `Remove "${note.title}" from your workspace. This action cannot be undone.`
                : "Remove this note from your workspace."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteNoteMutation.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteNoteMutation.isPending}>
              {deleteNoteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
