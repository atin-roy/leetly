"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ChevronLeft, ChevronRight, Clock3, Layers3, Sparkles, Target } from "lucide-react"
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
import { useCreateProblem, useDeleteProblem, useProblems } from "@/hooks/use-problems"
import { useNotes } from "@/hooks/use-notes"
import { useEnrollReview, useRemoveReview } from "@/hooks/use-reviews"
import { getNewNoteHref, getNoteHref } from "@/lib/note-display"
import type { CreateProblemRequest, ProblemFilters as Filters, ProblemSummaryDto } from "@/lib/types"

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
  const router = useRouter()
  const [filters, setFilters] = useState<Filters>(() => readStoredFilters(PROBLEMS_FILTERS_STORAGE_KEY))
  const { data: pagedResponse, error, isError, isLoading } = useProblems(filters)
  const createProblemMutation = useCreateProblem()
  const deleteProblemMutation = useDeleteProblem()
  const enrollReviewMutation = useEnrollReview()
  const removeReviewMutation = useRemoveReview()
  const { data: notesData } = useNotes({ size: 200 })

  const noteIdsByProblemId = useMemo(() => {
    const ids = new Map<number, number>()
    const times = new Map<number, number>()
    if (notesData?.content) {
      for (const n of notesData.content) {
        if (n.problemId != null) {
          const time = new Date(n.dateTime).getTime()
          if ((times.get(n.problemId) ?? Number.NEGATIVE_INFINITY) < time) {
            times.set(n.problemId, time)
            ids.set(n.problemId, n.id)
          }
        }
      }
    }
    return ids
  }, [notesData])
  const [pendingDeleteProblem, setPendingDeleteProblem] = useState<ProblemSummaryDto | null>(null)

  const problems = useMemo(() => pagedResponse?.content ?? [], [pagedResponse?.content])
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
    const noteId = noteIdsByProblemId.get(problem.id)
    router.push(
      noteId
        ? getNoteHref(noteId, "/problems")
        : getNewNoteHref({ problemId: problem.id, title: problem.title, returnTo: "/problems" }),
    )
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
  const solvedCount = useMemo(
    () => problems.filter((problem) => problem.status === "SOLVED" || problem.status === "MASTERED").length,
    [problems],
  )
  const reviewCount = useMemo(
    () => problems.filter((problem) => problem.reviewCard !== null).length,
    [problems],
  )
  const activeAttemptCount = useMemo(
    () => problems.filter((problem) => problem.totalAttempts > 0).length,
    [problems],
  )
  const activeFilterCount = useMemo(
    () =>
      [
        filters.difficulty,
        filters.status,
        filters.topicId,
        filters.patternId,
        filters.search,
        filters.sort && filters.sort !== DEFAULT_FILTERS.sort ? filters.sort : undefined,
      ].filter(Boolean).length,
    [filters],
  )

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
    <div className="space-y-5">
      <Card
        className="overflow-hidden border-border/70"
        style={{
          background: [
            "radial-gradient(circle at 12% 20%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 34%)",
            "radial-gradient(circle at 86% 18%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 30%)",
            "linear-gradient(145deg, color-mix(in srgb, var(--card) 90%, var(--background) 10%), color-mix(in srgb, var(--background) 92%, var(--card) 8%))",
          ].join(", "),
        }}
      >
        <CardContent className="space-y-5 p-4 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Practice Inventory
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Curate your problem set like a real working backlog.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Search faster, filter with intention, and act on each problem without getting buried in admin-table noise.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-left sm:text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Visible now</p>
                <p className="text-2xl font-semibold text-foreground">{totalElements}</p>
              </div>
              <AddProblemDialog onAdd={handleAdd} existingProblems={existingProblems} />
            </div>
          </div>

          <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Solved Momentum</p>
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{solvedCount}</p>
              <p className="mt-1 text-sm text-muted-foreground">Solved or mastered in this view.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Review Pressure</p>
                <Clock3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{reviewCount}</p>
              <p className="mt-1 text-sm text-muted-foreground">Problems already enrolled in spaced review.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Active Attempts</p>
                <Layers3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{activeAttemptCount}</p>
              <p className="mt-1 text-sm text-muted-foreground">Problems with at least one logged attempt.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Filter Load</p>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{activeFilterCount}</p>
              <p className="mt-1 text-sm text-muted-foreground">Constraints shaping the current result set.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProblemFilters
        filters={filters}
        onChange={handleChange}
        onReset={handleReset}
      />

      <Card className="overflow-hidden border-border/70 py-0 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 sm:px-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-foreground">Problem Index</p>
            <p className="text-sm text-muted-foreground">
              Browse the current slice, jump into detail, or act inline without leaving the table.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{totalElements} total</span>
            <span className="text-border">•</span>
            <span>{problems.length} on this page</span>
            <span className="text-border">•</span>
            <span>Page {page + 1} of {totalPages}</span>
          </div>
        </div>
        <CardContent className="p-0">
          <ProblemTable
            problems={problems}
            pageSize={PAGE_SIZE}
            onNoteClick={handleNoteClick}
            onDelete={handleDelete}
            notedProblemIds={new Set(noteIdsByProblemId.keys())}
            onEnrollReview={(p) => enrollReviewMutation.mutate(p.id)}
            onRemoveReview={(_problemId, cardId) => removeReviewMutation.mutate(cardId)}
          />
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
