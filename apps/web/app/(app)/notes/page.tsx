"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { NoteForm } from "@/components/notes/note-form"
import { useDeleteNote, useNotes } from "@/hooks/use-notes"
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

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: NoteDto
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base">{note.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={TAG_COLORS[note.tag]}
              >
                {note.tag}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(note.dateTime), "MMM d, yyyy")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
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
        <p className="whitespace-pre-wrap text-sm text-muted-foreground line-clamp-3">
          {note.content}
        </p>
      </CardContent>
    </Card>
  )
}

const DEFAULT_FILTERS: NoteFilters = { page: 0, size: 20 }

export default function NotesPage() {
  const [filters, setFilters] = useState<NoteFilters>(DEFAULT_FILTERS)
  const [formOpen, setFormOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteDto | undefined>()
  const { data, isLoading } = useNotes(filters)
  const deleteMutation = useDeleteNote()

  function handleChange(partial: Partial<NoteFilters>) {
    setFilters((f) => ({ ...f, ...partial }))
  }

  function handleEdit(note: NoteDto) {
    setEditingNote(note)
    setFormOpen(true)
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this note?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Note deleted")
    } catch {
      toast.error("Failed to delete note")
    }
  }

  const page = filters.page ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
        <Button
          size="sm"
          onClick={() => {
            setEditingNote(undefined)
            setFormOpen(true)
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          New Note
        </Button>
      </div>

      <div className="flex items-center gap-2">
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

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : !data?.content.length ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          No notes yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.content.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
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

      <NoteForm
        open={formOpen}
        onOpenChange={setFormOpen}
        note={editingNote}
      />
    </div>
  )
}
