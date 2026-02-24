"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NoteEditorDialog } from "@/components/notes/note-editor-dialog"
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/use-notes"
import type { NoteDto, NoteFilters, NoteTag } from "@/lib/types"

const TAG_COLORS: Record<NoteTag, string> = {
  GENERAL: "bg-gray-100 text-gray-700",
  INTERVIEW: "bg-blue-100 text-blue-700",
  LEARNING: "bg-green-100 text-green-700",
  REVIEW: "bg-orange-100 text-orange-700",
  STRATEGY: "bg-purple-100 text-purple-700",
}

const TAGS: { value: NoteTag; label: string }[] = [
  { value: "GENERAL", label: "General" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "LEARNING", label: "Learning" },
  { value: "REVIEW", label: "Review" },
  { value: "STRATEGY", label: "Strategy" },
]

const PAGE_SIZE = 20
const DEFAULT_FILTERS: NoteFilters = { page: 0, size: PAGE_SIZE }

function NoteCard({
  note,
  onClick,
  onEdit,
  onDelete,
}: {
  note: NoteDto
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Card
      className="group cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base">{note.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={TAG_COLORS[note.tag]}>
                {note.tag}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(note.dateTime), "MMM d, yyyy")}
              </span>
            </div>
          </div>
          <div
            className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
          {note.content}
        </p>
      </CardContent>
    </Card>
  )
}

export default function NotesPage() {
  const [filters, setFilters] = useState<NoteFilters>(DEFAULT_FILTERS)
  const { data: pagedResponse, isLoading } = useNotes(filters)
  const createNoteMutation = useCreateNote()
  const updateNoteMutation = useUpdateNote()
  const deleteNoteMutation = useDeleteNote()

  const [formOpen, setFormOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<NoteDto | undefined>()
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view")

  const notes = pagedResponse?.content ?? []
  const page = pagedResponse?.page ?? 0
  const totalPages = pagedResponse?.totalPages ?? 1

  function handleChange(partial: Partial<NoteFilters>) {
    setFilters((f) => ({ ...f, ...partial }))
  }

  function handleView(note: NoteDto) {
    setSelectedNote(note)
    setDialogMode("view")
    setFormOpen(true)
  }

  function handleEdit(note: NoteDto) {
    setSelectedNote(note)
    setDialogMode("edit")
    setFormOpen(true)
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this note?")) return
    try {
      await deleteNoteMutation.mutateAsync(id)
      toast.success("Note deleted")
    } catch {
      toast.error("Failed to delete note")
    }
  }

  async function handleSave({ tag, title, content }: { tag: NoteTag; title: string; content: string }) {
    try {
      if (selectedNote) {
        await updateNoteMutation.mutateAsync({ id: selectedNote.id, body: { tag, title, content } })
        toast.success("Note updated")
      } else {
        await createNoteMutation.mutateAsync({ tag, title, content })
        toast.success("Note created")
      }
    } catch {
      toast.error("Failed to save note")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
        <Button
          size="sm"
          onClick={() => {
            setSelectedNote(undefined)
            setDialogMode("edit")
            setFormOpen(true)
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          New Note
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search notes..."
            value={filters.search ?? ""}
            onChange={(e) =>
              handleChange({ search: e.target.value || undefined, page: 0 })
            }
            className="pl-8"
          />
        </div>
        <Select
          value={filters.tag ?? "all"}
          onValueChange={(v) =>
            handleChange({ tag: v === "all" ? undefined : (v as NoteTag), page: 0 })
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {TAGS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {notes.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-sm text-muted-foreground">
          <p>No notes yet.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedNote(undefined)
              setDialogMode("edit")
              setFormOpen(true)
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Create your first note
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => handleView(note)}
              onEdit={() => handleEdit(note)}
              onDelete={() => handleDelete(note.id)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => handleChange({ page: page - 1 })}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => handleChange({ page: page + 1 })}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <NoteEditorDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        note={selectedNote}
        initialMode={dialogMode}
        onSave={handleSave}
      />
    </div>
  )
}
