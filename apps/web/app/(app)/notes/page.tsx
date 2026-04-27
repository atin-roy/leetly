"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Layers3,
  List,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { MarkdownContent } from "@/components/ui/markdown-content"
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

const PAGE_SIZE = 20
const DEFAULT_FILTERS: NoteFilters = { page: 0, size: PAGE_SIZE }
const NOTES_FILTERS_STORAGE_KEY = "leetly:notes-filters"
type NotesViewMode = "cards" | "table"

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

function formatTagLabel(tag: NoteTag) {
  return NOTE_TAGS.find((item) => item.value === tag)?.label ?? tag
}

function getNoteExcerpt(content: string) {
  return content
    .replace(/[#>*`_~\-]/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
}

function countWords(content: string) {
  const excerpt = getNoteExcerpt(content)
  if (!excerpt) return 0
  return excerpt.split(" ").length
}

function NoteSurfaceActions({
  note,
  onEdit,
  onDelete,
}: {
  note: NoteDto
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
        onClick={onEdit}
        aria-label={`Edit ${note.title}`}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full text-muted-foreground hover:bg-accent hover:text-destructive"
        onClick={onDelete}
        aria-label={`Delete ${note.title}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

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
  const excerpt = getNoteExcerpt(note.content)
  const wordCount = countWords(note.content)

  return (
    <Card
      className="group cursor-pointer overflow-hidden border-border/70 bg-card/80 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.35)] transition-colors hover:border-border hover:bg-card"
      onClick={onClick}
    >
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <Badge variant="secondary" className={cn("rounded-full px-2.5 py-1 text-[11px]", NOTE_TAG_COLORS[note.tag])}>
                {formatTagLabel(note.tag)}
              </Badge>
              <span>{formatNoteDate(note.dateTime)}</span>
            </div>
            <h3 className="line-clamp-2 text-lg font-semibold leading-6 text-foreground">{note.title}</h3>
          </div>

          <NoteSurfaceActions note={note} onEdit={onEdit} onDelete={onDelete} />
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
          <MarkdownContent
            content={note.content}
            className="line-clamp-6 text-sm leading-6 text-muted-foreground [&>*:first-child]:mt-0 [&>h1]:text-base [&>h1]:font-semibold [&>h2]:text-sm [&>h2]:font-semibold [&>h3]:text-sm [&>h3]:font-semibold [&>p]:my-2 [&>ul]:my-2 [&>ol]:my-2 [&>blockquote]:my-2 [&>pre]:my-2 [&>table]:my-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Density</p>
            <p className="mt-1 text-sm font-medium text-foreground">{wordCount} words</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Preview</p>
            <p className="mt-1 line-clamp-1 text-sm font-medium text-foreground">
              {excerpt || "No written content yet"}
            </p>
          </div>
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
    <>
      <div className="space-y-3 p-3 sm:hidden">
        {notes.map((note) => (
          <article
            key={note.id}
            className="rounded-3xl border border-border/70 bg-card/80 p-4 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.35)]"
          >
            <div className="space-y-4" onClick={() => onView(note)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    <Badge variant="secondary" className={cn("rounded-full px-2.5 py-1 text-[11px]", NOTE_TAG_COLORS[note.tag])}>
                      {formatTagLabel(note.tag)}
                    </Badge>
                    <span>{formatNoteDate(note.dateTime)}</span>
                  </div>
                  <h3 className="text-base font-semibold leading-6 text-foreground">{note.title}</h3>
                </div>
                <NoteSurfaceActions
                  note={note}
                  onEdit={() => onEdit(note)}
                  onDelete={() => onDelete(note)}
                />
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
                  {getNoteExcerpt(note.content) || "No written content yet"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-11 rounded-full border-border/70 bg-background/70"
                  onClick={() => onView(note)}
                >
                  Open Note
                </Button>
                <Button
                  variant="outline"
                  className="h-11 rounded-full border-border/70 bg-background/70"
                  onClick={() => onEdit(note)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Table className="hidden sm:table">
        <TableHeader>
          <TableRow className="border-b border-border/70 bg-background/65">
            <TableHead className="w-[46%] py-4">Note</TableHead>
            <TableHead className="w-[18%] py-4">Tag</TableHead>
            <TableHead className="w-[20%] py-4">Updated</TableHead>
            <TableHead className="w-[10%] py-4">Length</TableHead>
            <TableHead className="w-[6%] py-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.map((note) => (
            <TableRow
              key={note.id}
              className="h-[96px] cursor-pointer border-b border-border/60 transition-colors hover:bg-accent/25"
              onClick={() => onView(note)}
            >
              <TableCell className="py-4">
                <div className="space-y-2">
                  <p className="line-clamp-1 text-base font-semibold text-foreground">{note.title}</p>
                  <p className="line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {getNoteExcerpt(note.content) || "No written content yet"}
                  </p>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <Badge variant="secondary" className={cn("rounded-full px-2.5 py-1 text-[11px]", NOTE_TAG_COLORS[note.tag])}>
                  {formatTagLabel(note.tag)}
                </Badge>
              </TableCell>
              <TableCell className="py-4 text-sm text-muted-foreground">
                {formatNoteDate(note.dateTime)}
              </TableCell>
              <TableCell className="py-4 text-sm font-medium text-foreground">
                {countWords(note.content)}
              </TableCell>
              <TableCell className="py-4">
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                  <NoteSurfaceActions
                    note={note}
                    onEdit={() => onEdit(note)}
                    onDelete={() => onDelete(note)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default function NotesPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<NoteFilters>(() => readStoredFilters(NOTES_FILTERS_STORAGE_KEY))
  const [searchValue, setSearchValue] = useState(filters.search ?? "")
  const { data: pagedResponse, isLoading } = useNotes(filters)
  const deleteNoteMutation = useDeleteNote()
  const [deleteNoteId, setDeleteNoteId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<NotesViewMode>("cards")

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

  const activeFilterCount = [
    filters.search,
    filters.tag,
  ].filter(Boolean).length

  const strategyNotes = useMemo(() => notes.filter((note) => note.tag === "STRATEGY").length, [notes])
  const reviewNotes = useMemo(() => notes.filter((note) => note.tag === "REVIEW").length, [notes])
  const totalWords = useMemo(
    () => notes.reduce((sum, note) => sum + countWords(note.content), 0),
    [notes],
  )
  const longestNoteWords = useMemo(
    () => notes.reduce((max, note) => Math.max(max, countWords(note.content)), 0),
    [notes],
  )

  if (isLoading && !pagedResponse) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-52 w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[20rem] w-full rounded-3xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Card
        className="overflow-hidden border-border/70"
        style={{
          background: [
            "radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 34%)",
            "radial-gradient(circle at 86% 22%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 30%)",
            "linear-gradient(145deg, color-mix(in srgb, var(--card) 90%, var(--background) 10%), color-mix(in srgb, var(--background) 92%, var(--card) 8%))",
          ].join(", "),
        }}
      >
        <CardContent className="space-y-5 p-4 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Knowledge Workspace
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Keep your notes readable, searchable, and worth revisiting.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Capture learnings, strategy, and interview insight in a workspace that feels curated instead of dumped into a flat list.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-left sm:text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Visible now</p>
                <p className="text-2xl font-semibold text-foreground">{totalNotes}</p>
              </div>
              <Button onClick={() => router.push(getNewNoteHref({ returnTo: "/notes" }))}>
                <Plus className="mr-2 h-4 w-4" />
                New Note
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Strategy Stack</p>
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{strategyNotes}</p>
              <p className="mt-1 text-sm text-muted-foreground">Strategy notes in this slice.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Review Archive</p>
                <BookMarked className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{reviewNotes}</p>
              <p className="mt-1 text-sm text-muted-foreground">Review-oriented retrospectives.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Words Captured</p>
                <Layers3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{totalWords}</p>
              <p className="mt-1 text-sm text-muted-foreground">Approximate words on this page.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Longest Draft</p>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{longestNoteWords}</p>
              <p className="mt-1 text-sm text-muted-foreground">Longest note in the current result set.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 bg-card/80 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
        <CardContent className="space-y-5 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <Search className="h-3.5 w-3.5" />
                Note Explorer
              </div>
              <p className="text-sm font-medium text-foreground">Filter by tag, search by phrase, and switch between browsing modes without losing context.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                {activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}
              </Badge>
              <div className="flex rounded-full border border-border/70 bg-background/70 p-1">
                <Button
                  type="button"
                  variant={viewMode === "cards" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-full px-3"
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
                  className="rounded-full px-3"
                  aria-pressed={viewMode === "table"}
                  onClick={() => setViewMode("table")}
                >
                  <List className="mr-1.5 h-4 w-4" />
                  Index
                </Button>
              </div>
              {activeFilterCount > 0 ? (
                <Button variant="ghost" size="sm" className="rounded-full" onClick={handleReset}>
                  Clear filters
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.7fr)]">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Search</p>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes, concepts, or takeaways..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="h-11 rounded-xl border-border/70 bg-background/85 pl-9 shadow-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Tag</p>
              <Select
                value={filters.tag ?? "all"}
                onValueChange={(value) => handleChange({ tag: value === "all" ? undefined : (value as NoteTag), page: 0 })}
              >
                <SelectTrigger className="h-11 rounded-xl border-border/70 bg-background/85 shadow-none">
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
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 py-0 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 sm:px-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-foreground">Notes Library</p>
            <p className="text-sm text-muted-foreground">
              Browse the current slice, open full entries, and keep editing friction low.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{totalNotes} total</span>
            <span className="text-border">•</span>
            <span>{notes.length} on this page</span>
            <span className="text-border">•</span>
            <span>Page {page + 1} of {totalPages}</span>
          </div>
        </div>

        <CardContent className="p-0">
          {notes.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted-foreground">
              <p>No notes match this view.</p>
              <Button variant="outline" onClick={() => router.push(getNewNoteHref({ returnTo: "/notes" }))}>
                <Plus className="mr-2 h-4 w-4" />
                Create a note
              </Button>
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
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
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
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
