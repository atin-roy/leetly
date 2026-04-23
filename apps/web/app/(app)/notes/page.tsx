"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Grid3X3, List, Pencil, Plus, Search, Trash2 } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MarkdownContent } from "@/components/ui/markdown-content"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useNotes, useDeleteNote } from "@/hooks/use-notes"
import {
  formatNoteDate,
  getNewNoteHref,
  getNoteEditHref,
  getNoteHref,
  NOTE_TAG_COLORS,
  NOTE_TAGS,
} from "@/lib/note-display"
import type { NoteDto, NoteFilters, NoteTag } from "@/lib/types"

const PAGE_SIZE = 20
const DEFAULT_FILTERS: NoteFilters = { page: 0, size: PAGE_SIZE }
type NotesViewMode = "cards" | "table"

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
      className="group flex min-h-[14rem] cursor-pointer flex-col transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base">{note.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={NOTE_TAG_COLORS[note.tag]}>
                {note.tag}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatNoteDate(note.dateTime)}
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
      <CardContent className="flex-1">
        <div className="relative h-[8.5rem] overflow-hidden rounded-md border bg-muted/20 p-4">
          <MarkdownContent
            content={note.content}
            className="text-sm text-muted-foreground [&>h1]:mt-0 [&>h1]:text-lg [&>h1]:pb-1 [&>h2]:mt-3 [&>h2]:text-base [&>h3]:mt-3 [&>h3]:text-sm [&>p]:my-2 [&>ul]:my-2 [&>ol]:my-2 [&>blockquote]:my-2 [&>pre]:my-2 [&>table]:my-2"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card via-card/90 to-transparent" />
        </div>
      </CardContent>
    </Card>
  )
}

function NoteTable({
  notes,
  onView,
  onEdit,
  onDelete,
}: {
  notes: NoteDto[]
  onView: (note: NoteDto) => void
  onEdit: (note: NoteDto) => void
  onDelete: (note: NoteDto) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead className="w-32">Tag</TableHead>
          <TableHead className="w-32">Date</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {notes.map((note) => (
          <TableRow
            key={note.id}
            className="h-14 cursor-pointer"
            onClick={() => onView(note)}
          >
            <TableCell className="max-w-64 font-medium">
              <div className="truncate">{note.title}</div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className={NOTE_TAG_COLORS[note.tag]}>
                {note.tag}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatNoteDate(note.dateTime)}
            </TableCell>
            <TableCell>
              <div
                className="flex justify-end gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Edit ${note.title}`}
                  onClick={() => onEdit(note)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  aria-label={`Delete ${note.title}`}
                  onClick={() => onDelete(note)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function NotesPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<NoteFilters>(DEFAULT_FILTERS)
  const { data: pagedResponse, isLoading } = useNotes(filters)
  const deleteNoteMutation = useDeleteNote()
  const [deleteNoteId, setDeleteNoteId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<NotesViewMode>("table")

  const notes = pagedResponse?.content ?? []
  const page = pagedResponse?.page ?? 0
  const totalPages = pagedResponse?.totalPages ?? 1
  const totalNotes = pagedResponse?.totalElements ?? 0

  function handleChange(partial: Partial<NoteFilters>) {
    setFilters((f) => ({ ...f, ...partial }))
  }

  async function handleDelete() {
    if (deleteNoteId == null) return
    try {
      await deleteNoteMutation.mutateAsync(deleteNoteId)
      setDeleteNoteId(null)
      toast.success("Note deleted")
    } catch {
      toast.error("Failed to delete note")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 max-w-sm flex-1" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[14rem] w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
          <p className="text-sm text-muted-foreground">
            {totalNotes} {totalNotes === 1 ? "note" : "notes"}
          </p>
        </div>
        <Button size="sm" onClick={() => router.push(getNewNoteHref({ returnTo: "/notes" }))}>
          <Plus className="mr-1 h-4 w-4" />
          New Note
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
            {NOTE_TAGS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex rounded-md border bg-background p-0.5 sm:ml-auto">
          <Button
            type="button"
            variant={viewMode === "cards" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-3"
            aria-pressed={viewMode === "cards"}
            onClick={() => setViewMode("cards")}
          >
            <Grid3X3 className="mr-1.5 h-4 w-4" />
            Cards
          </Button>
          <Button
            type="button"
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-3"
            aria-pressed={viewMode === "table"}
            onClick={() => setViewMode("table")}
          >
            <List className="mr-1.5 h-4 w-4" />
            Table
          </Button>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-sm text-muted-foreground">
          <p>No notes yet.</p>
          <Button size="sm" variant="outline" onClick={() => router.push(getNewNoteHref({ returnTo: "/notes" }))}>
            <Plus className="mr-1 h-4 w-4" />
            Create your first note
          </Button>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => router.push(getNoteHref(note.id, "/notes"))}
              onEdit={() => router.push(getNoteEditHref(note.id, "/notes"))}
              onDelete={() => setDeleteNoteId(note.id)}
            />
          ))}
        </div>
      ) : (
        <NoteTable
          notes={notes}
          onView={(note) => router.push(getNoteHref(note.id, "/notes"))}
          onEdit={(note) => router.push(getNoteEditHref(note.id, "/notes"))}
          onDelete={(note) => setDeleteNoteId(note.id)}
        />
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

      <Dialog open={deleteNoteId !== null} onOpenChange={(open) => !open && setDeleteNoteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete note</DialogTitle>
            <DialogDescription>
              This will permanently remove the note from your workspace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteNoteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteNoteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
