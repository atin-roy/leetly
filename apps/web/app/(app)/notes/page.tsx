"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDeleteNote, useNotes } from "@/hooks/use-notes"
import {
  formatNoteDate,
  getNewNoteHref,
  getNoteEditHref,
  getNoteHref,
  NOTE_TAG_COLORS,
  NOTE_TAGS,
} from "@/lib/note-display"
import { cn } from "@/lib/utils"
import type { NoteDto, NoteFilters, NoteTag } from "@/lib/types"
import styles from "./notes.module.css"

const PAGE_SIZE = 20
const DEFAULT_FILTERS: NoteFilters = { page: 0, size: PAGE_SIZE }
const NOTES_FILTERS_STORAGE_KEY = "leetly:notes-filters"

function sanitizeStoredFilters(value: unknown): NoteFilters {
  if (!value || typeof value !== "object") return DEFAULT_FILTERS

  const record = value as Record<string, unknown>
  return {
    page: typeof record.page === "number" && record.page >= 0 ? record.page : DEFAULT_FILTERS.page,
    size: typeof record.size === "number" && record.size > 0 ? record.size : DEFAULT_FILTERS.size,
    tag: typeof record.tag === "string" ? record.tag as NoteTag : undefined,
    search: typeof record.search === "string" && record.search.length > 0 ? record.search : undefined,
  }
}

function readStoredFilters(storageKey: string) {
  if (typeof window === "undefined") return DEFAULT_FILTERS

  try {
    const stored = localStorage.getItem(storageKey)
    return stored ? sanitizeStoredFilters(JSON.parse(stored)) : DEFAULT_FILTERS
  } catch {
    return DEFAULT_FILTERS
  }
}

function getNoteExcerpt(content: string) {
  return content
    .replace(/[#>*`_~-]/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
}

function countWords(content: string) {
  const excerpt = getNoteExcerpt(content)
  if (!excerpt) return 0
  return excerpt.split(" ").length
}

function Fact({ label, value }: { label: string; value: number | string }) {
  return (
    <div className={styles.fact}>
      <span className={styles.factLabel}>{label}</span>
      <span className={styles.factValue}>{value}</span>
    </div>
  )
}

function NoteSurfaceActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="icon-sm" className={styles.iconButton} onClick={onEdit} aria-label="Edit note">
        <Pencil size={14} />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn(styles.iconButton, styles.iconButtonDanger)}
        onClick={onDelete}
        aria-label="Delete note"
      >
        <Trash2 size={14} />
      </Button>
    </div>
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
    <Table className={styles.table}>
      <TableHeader>
        <TableRow className={styles.headRow}>
          <TableHead className={styles.headCell}>Note</TableHead>
          <TableHead className={styles.headCell}>Tag</TableHead>
          <TableHead className={styles.headCell}>Updated</TableHead>
          <TableHead className={styles.headCell}>Length</TableHead>
          <TableHead className={styles.headCell} />
        </TableRow>
      </TableHeader>
      <TableBody>
        {notes.map((note) => (
          <TableRow key={note.id} className={styles.row} onClick={() => onView(note)}>
            <TableCell className={styles.cell}>
              <p className={styles.rowTitle}>{note.title}</p>
              <p className={styles.rowExcerpt}>{getNoteExcerpt(note.content) || "No written content yet"}</p>
            </TableCell>
            <TableCell className={styles.cell}>
              <Badge variant="secondary" className={cn(styles.tag, NOTE_TAG_COLORS[note.tag])}>
                {note.tag}
              </Badge>
            </TableCell>
            <TableCell className={styles.cell}>{formatNoteDate(note.dateTime)}</TableCell>
            <TableCell className={styles.cell}>{countWords(note.content)}</TableCell>
            <TableCell className={styles.cell}>
              <NoteSurfaceActions onEdit={() => onEdit(note)} onDelete={() => onDelete(note)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function NotesPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<NoteFilters>(() => readStoredFilters(NOTES_FILTERS_STORAGE_KEY))
  const [searchValue, setSearchValue] = useState(filters.search ?? "")
  const { data: pagedResponse, isLoading } = useNotes(filters)
  const deleteNoteMutation = useDeleteNote()
  const [deleteNoteId, setDeleteNoteId] = useState<number | null>(null)

  const notes = useMemo(() => pagedResponse?.content ?? [], [pagedResponse?.content])
  const page = pagedResponse?.page ?? 0
  const totalPages = pagedResponse?.totalPages ?? 1
  const totalNotes = pagedResponse?.totalElements ?? 0

  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem(NOTES_FILTERS_STORAGE_KEY, JSON.stringify(filters))
  }, [filters])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const normalized = searchValue.trim()
      const nextSearch = normalized || undefined
      if (nextSearch !== filters.search) {
        setFilters((current) => ({ ...current, search: nextSearch, page: 0 }))
      }
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [filters.search, searchValue])

  function handleChange(partial: Partial<NoteFilters>) {
    setFilters((current) => ({ ...current, ...partial }))
  }

  function handleReset() {
    setSearchValue("")
    setFilters(DEFAULT_FILTERS)
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

  const hasFilters = Boolean(filters.search || filters.tag)

  const strategyNotes = useMemo(() => notes.filter((note) => note.tag === "STRATEGY").length, [notes])
  const reviewNotes = useMemo(() => notes.filter((note) => note.tag === "REVIEW").length, [notes])
  const totalWords = useMemo(
    () => notes.reduce((sum, note) => sum + countWords(note.content), 0),
    [notes],
  )

  if (isLoading && !pagedResponse) {
    return (
      <div className={styles.skeletonPage}>
        <Skeleton className={styles.skeletonHeader} />
        <Skeleton className={styles.skeletonFacts} />
        <Skeleton className={styles.skeletonBar} />
        <Skeleton className={styles.skeletonLibrary} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Notes</p>
          <h1 className={styles.title}>
            {totalNotes} {totalNotes === 1 ? "note" : "notes"} captured.
          </h1>
          <p className={styles.lede}>
            Capture strategy, learnings, and interview insight in one searchable
            workspace.
          </p>
        </div>
        <div className={styles.actions}>
          <Button onClick={() => router.push(getNewNoteHref({ returnTo: "/notes" }))}>
            <Plus />
            New note
          </Button>
        </div>
      </header>

      <div className={styles.facts}>
        <Fact label="Notes" value={totalNotes} />
        <Fact label="Strategy" value={strategyNotes} />
        <Fact label="Review" value={reviewNotes} />
        <Fact label="Words captured" value={totalWords} />
      </div>

      <div className={styles.bar}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="note-search">
            Search
          </label>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} aria-hidden="true" />
            <Input
              id="note-search"
              placeholder="Search notes, concepts, or takeaways..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className={styles.search}
            />
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Tag</span>
          <Select
            value={filters.tag ?? "all"}
            onValueChange={(value) => handleChange({ tag: value === "all" ? undefined : (value as NoteTag), page: 0 })}
          >
            <SelectTrigger className={styles.select}>
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {NOTE_TAGS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasFilters ? (
          <Button variant="ghost" size="sm" className={styles.clear} onClick={handleReset}>
            <X />
            Clear
          </Button>
        ) : null}
      </div>

      <div className={styles.libraryShell}>
        {notes.length === 0 ? (
          <div className={styles.empty}>
            <p>No notes match this view.</p>
            <Button variant="outline" onClick={() => router.push(getNewNoteHref({ returnTo: "/notes" }))}>
              <Plus />
              Create a note
            </Button>
          </div>
        ) : (
          <NoteTable
            notes={notes}
            onView={(note) => router.push(getNoteHref(note.id, "/notes"))}
            onEdit={(note) => router.push(getNoteEditHref(note.id, "/notes"))}
            onDelete={(note) => setDeleteNoteId(note.id)}
          />
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pager}>
          <p className={styles.pagerStatus}>
            Page {page + 1} of {totalPages}
          </p>
          <div className={styles.pagerButtons}>
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => handleChange({ page: page - 1 })}>
              <ChevronLeft />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => handleChange({ page: page + 1 })}
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={deleteNoteId !== null} onOpenChange={(open) => !open && setDeleteNoteId(null)}>
        <DialogContent>
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
            <Button variant="destructive" onClick={handleDelete} disabled={deleteNoteMutation.isPending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
