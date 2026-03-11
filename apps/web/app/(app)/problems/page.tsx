"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"
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
import { Skeleton } from "@/components/ui/skeleton"
import { ProblemFilters } from "@/components/problems/problem-filters"
import { ProblemTable } from "@/components/problems/problem-table"
import { AddProblemDialog } from "@/components/problems/add-problem-dialog"
import { NoteEditorDialog } from "@/components/notes/note-editor-dialog"
import { useCreateProblem, useDeleteProblem, useProblems } from "@/hooks/use-problems"
import { useNotes, useCreateNote, useUpdateNote } from "@/hooks/use-notes"
import type { CreateProblemRequest, NoteDto, NoteTag, ProblemFilters as Filters, ProblemSummaryDto } from "@/lib/types"

const PAGE_SIZE = 20
const DEFAULT_FILTERS: Filters = { page: 0, size: PAGE_SIZE, sort: "createdDate,desc" }
const PROBLEMS_FILTERS_STORAGE_KEY = "leetly:problems-filters"

function sanitizeStoredFilters(value: unknown): Filters {
  if (!value || typeof value !== "object") return DEFAULT_FILTERS

  const record = value as Record<string, unknown>
  return {
    page: typeof record.page === "number" && record.page >= 0 ? record.page : DEFAULT_FILTERS.page,
    size: typeof record.size === "number" && record.size > 0 ? record.size : DEFAULT_FILTERS.size,
    sort: typeof record.sort === "string" && record.sort.length > 0 ? record.sort : DEFAULT_FILTERS.sort,
    difficulty: typeof record.difficulty === "string" ? record.difficulty as Filters["difficulty"] : undefined,
    status: typeof record.status === "string" ? record.status as Filters["status"] : undefined,
    topicId: typeof record.topicId === "number" ? record.topicId : undefined,
    patternId: typeof record.patternId === "number" ? record.patternId : undefined,
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

export default function ProblemsPage() {
  const [filters, setFilters] = useState<Filters>(() => readStoredFilters(PROBLEMS_FILTERS_STORAGE_KEY))
  const { data: pagedResponse, error, isError, isLoading } = useProblems(filters)
  const createProblemMutation = useCreateProblem()
  const deleteProblemMutation = useDeleteProblem()
  const createNoteMutation = useCreateNote()
  const updateNoteMutation = useUpdateNote()
  const { data: notesData } = useNotes({ size: 200 })

  const problemNotes = useMemo(() => {
    const map: Record<number, NoteDto> = {}
    if (notesData?.content) {
      for (const n of notesData.content) {
        if (n.problemId != null) {
          map[n.problemId] = n
        }
      }
    }
    return map
  }, [notesData])
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [selectedProblem, setSelectedProblem] = useState<ProblemSummaryDto | undefined>()
  const [pendingDeleteProblem, setPendingDeleteProblem] = useState<ProblemSummaryDto | null>(null)

  const problems = pagedResponse?.content ?? []
  const page = pagedResponse?.page ?? 0
  const totalPages = pagedResponse?.totalPages ?? 1
  const totalElements = pagedResponse?.totalElements ?? 0

  useEffect(() => {
    if (typeof window === "undefined") return

    localStorage.setItem(PROBLEMS_FILTERS_STORAGE_KEY, JSON.stringify(filters))
  }, [filters])

  function handleChange(partial: Partial<Filters>) {
    setFilters((f) => ({ ...f, ...partial }))
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS)
  }

  function handleNoteClick(problem: ProblemSummaryDto) {
    setSelectedProblem(problem)
    setNoteDialogOpen(true)
  }

  async function handleNoteSave({ tag, title, content }: { tag: NoteTag; title: string; content: string }) {
    if (!selectedProblem || !title.trim() || !content.trim()) return
    try {
      const existing = problemNotes[selectedProblem.id]
      if (existing) {
        await updateNoteMutation.mutateAsync({ id: existing.id, body: { tag, title, content } })
      } else {
        await createNoteMutation.mutateAsync({
          problemId: selectedProblem.id,
          tag,
          title,
          content,
        })
      }
    } catch {
      // Error handled by mutation
    }
  }

  async function handleAdd(p: CreateProblemRequest): Promise<ProblemSummaryDto> {
    return createProblemMutation.mutateAsync(p)
  }

  function handleDelete(problem: ProblemSummaryDto) {
    setPendingDeleteProblem(problem)
  }

  async function confirmDelete() {
    if (!pendingDeleteProblem) return
    try {
      await deleteProblemMutation.mutateAsync(pendingDeleteProblem.id)
      toast.success("Problem deleted")
      setPendingDeleteProblem(null)
    } catch {
      toast.error("Failed to delete problem")
    }
  }

  const existingProblems = new Map(problems.map((p) => [p.leetcodeId, p.id]))

  if (isLoading && !pagedResponse) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Problems</h1>
          <AddProblemDialog onAdd={handleAdd} existingProblems={new Map()} />
        </div>

        <ProblemFilters
          filters={filters}
          onChange={handleChange}
          onReset={handleReset}
        />

        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-6 text-sm text-muted-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
            <div>
              <p className="font-medium text-foreground">Failed to load problems.</p>
              <p>{error instanceof Error ? error.message : "Unexpected error"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Problems</h1>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{totalElements} problems</p>
          <AddProblemDialog onAdd={handleAdd} existingProblems={existingProblems} />
        </div>
      </div>

      <ProblemFilters
        filters={filters}
        onChange={handleChange}
        onReset={handleReset}
      />

      <Card className="py-0">
        <CardContent className="p-0">
          <ProblemTable
            problems={problems}
            pageSize={PAGE_SIZE}
            onNoteClick={handleNoteClick}
            onDelete={handleDelete}
            notedProblemIds={new Set(Object.keys(problemNotes).map(Number))}
          />
        </CardContent>
      </Card>

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
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        note={selectedProblem ? problemNotes[selectedProblem.id] : undefined}
        initialMode={selectedProblem && problemNotes[selectedProblem.id] ? "view" : "edit"}
        defaultTitle={selectedProblem?.title}
        onSave={handleNoteSave}
      />
      <Dialog
        open={pendingDeleteProblem !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteProblem(null)
        }}
      >
        <DialogContent showCloseButton={!deleteProblemMutation.isPending}>
          <DialogHeader>
            <DialogTitle>Delete problem?</DialogTitle>
            <DialogDescription>
              {pendingDeleteProblem
                ? `Remove "${pendingDeleteProblem.title}" from your problems list. This action cannot be undone.`
                : "Remove this problem from your problems list."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDeleteProblem(null)}
              disabled={deleteProblemMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteProblemMutation.isPending}
            >
              {deleteProblemMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
