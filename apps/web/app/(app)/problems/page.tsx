"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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
import { useCreateProblem, useDeleteProblem, useProblemRefs, useProblems } from "@/hooks/use-problems"
import { useNotes } from "@/hooks/use-notes"
import { useEnrollReview, useRemoveReview } from "@/hooks/use-reviews"
import { getNewNoteHref, getNoteHref } from "@/lib/note-display"
import type { CreateProblemRequest, ProblemFilters as Filters, ProblemSummaryDto } from "@/lib/types"
import styles from "./problems.module.css"

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
  const existingProblems = useProblemRefs()
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
      <div className={styles.skeletonPage}>
        <Skeleton className={styles.skeletonHeader} />
        <Skeleton className={styles.skeletonFacts} />
        <Skeleton className={styles.skeletonFilters} />
        <Skeleton className={styles.skeletonTable} />
      </div>
    )
  }

  const header = (
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>Problems</p>
        <h1 className={styles.title}>
          {totalElements} {totalElements === 1 ? "problem" : "problems"} tracked.
        </h1>
        <p className={styles.lede}>
          Filter down to the slice you want to work, then act on a row without
          leaving the table.
        </p>
      </div>

      <div className={styles.actions}>
        <AddProblemDialog onAdd={handleAdd} existingProblems={existingProblems} />
      </div>
    </header>
  )

  if (isError) {
    return (
      <div className={styles.page}>
        {header}

        <ProblemFilters
          filters={filters}
          onChange={handleChange}
          onReset={handleReset}
        />

        <div className={styles.error}>
          <AlertCircle size={16} className={styles.errorIcon} aria-hidden="true" />
          <div>
            <p className={styles.errorTitle}>Failed to load problems.</p>
            <p>{error instanceof Error ? error.message : "Unexpected error"}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {header}

      {/* Scoped to the current result set, not the whole library — the counts
          answer "what did my filters just select?", which is why they sit
          below the filters conceptually even though they render above. */}
      <div className={styles.facts}>
        <Fact label="Solved" value={solvedCount} caption="Or mastered, in view" />
        <Fact label="In review" value={reviewCount} caption="Enrolled in FSRS" />
        <Fact
          label="Attempted"
          value={activeAttemptCount}
          caption="At least one attempt"
        />
        <Fact
          label="Filters"
          value={activeFilterCount}
          caption={activeFilterCount === 0 ? "Showing everything" : "Narrowing the set"}
        />
      </div>

      <ProblemFilters
        filters={filters}
        onChange={handleChange}
        onReset={handleReset}
      />

      <div className={styles.tableShell}>
        <ProblemTable
          problems={problems}
          pageSize={PAGE_SIZE}
          onNoteClick={handleNoteClick}
          onDelete={handleDelete}
          notedProblemIds={new Set(noteIdsByProblemId.keys())}
          onEnrollReview={(p) => enrollReviewMutation.mutate(p.id)}
          onRemoveReview={(_problemId, cardId) => removeReviewMutation.mutate(cardId)}
        />
      </div>

      {totalPages > 1 && (
        <div className={styles.pager}>
          <p className={styles.pagerStatus}>
            Page {page + 1} of {totalPages}
          </p>
          <div className={styles.pagerButtons}>
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => handleChange({ page: page - 1 })}
            >
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

function Fact({
  label,
  value,
  caption,
}: {
  label: string
  value: number | string
  caption?: string
}) {
  return (
    <div className={styles.fact}>
      <span className={styles.factLabel}>{label}</span>
      <span className={styles.factValue}>{value}</span>
      {caption && <span className={styles.factCaption}>{caption}</span>}
    </div>
  )
}
