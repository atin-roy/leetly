"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, Pencil, StickyNote, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import type { NoteTag } from "@/lib/types"

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
      <div className="space-y-4">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-[32rem] w-full" />
      </div>
    )
  }

  if (noteId && !isNoteLoading && !note) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href={backHref}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground">
          Note not found.
        </div>
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
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href={backHref}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>
      </Button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className={NOTE_TAG_COLORS[tag]}>
              {tag}
            </Badge>
            {note?.dateTime ? (
              <span className="text-sm text-muted-foreground">
                {formatNoteDate(note.dateTime)}
              </span>
            ) : null}
            {problemId ? (
              <span className="text-sm text-muted-foreground">
                {isProblemLoading
                  ? "Loading problem…"
                  : problem
                    ? `Problem: ${problem.title}`
                    : `Problem #${problemId}`}
              </span>
            ) : null}
          </div>
          <div className="space-y-1">
            <h1 className="truncate text-3xl font-semibold tracking-tight">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground">{pageDescription}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {note ? (
            <>
              {mode === "view" ? (
                <Button variant="outline" onClick={() => setMode("edit")}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Edit
                </Button>
              ) : null}
              <Button
                variant="outline"
                className="text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
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
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <StickyNote className="h-5 w-5" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-5">
            <MarkdownContent content={content} />
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>{note ? "Edit Note" : "Create Note"}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Markdown source on the left, preview on the right when you need it.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview((value) => !value)}
              >
                {showPreview ? (
                  <>
                    <EyeOff className="mr-1.5 h-4 w-4" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="mr-1.5 h-4 w-4" />
                    Show Preview
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 px-6 py-5">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px]">
              <div className="space-y-1.5">
                <Label htmlFor="note-title">Title</Label>
                <Input
                  id="note-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Note title..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tag</Label>
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

            <div
              className={`grid min-h-[28rem] gap-4 ${showPreview ? "xl:grid-cols-2" : "grid-cols-1"}`}
            >
              <div className="space-y-1.5">
                <Label htmlFor="note-content">Markdown</Label>
                <Textarea
                  id="note-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Write your note in markdown..."
                  className="min-h-[26rem] resize-y font-mono text-sm"
                />
              </div>
              {showPreview ? (
                <div className="space-y-1.5">
                  <Label>Preview</Label>
                  <div className="min-h-[26rem] rounded-md border bg-muted/20 p-4">
                    {content.trim() ? (
                      <MarkdownContent content={content} />
                    ) : (
                      <p className="text-sm italic text-muted-foreground">
                        Preview will appear here...
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSave}
                disabled={!title.trim() || !content.trim() || createNoteMutation.isPending || updateNoteMutation.isPending}
              >
                {note ? "Save" : "Create"}
              </Button>
            </div>
          </CardContent>
        </Card>
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
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteNoteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteNoteMutation.isPending}
            >
              {deleteNoteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
