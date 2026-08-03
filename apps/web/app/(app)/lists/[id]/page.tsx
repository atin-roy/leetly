"use client"

import { use, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ProblemFilters } from "@/components/problems/problem-filters"
import { Skeleton } from "@/components/ui/skeleton"
import { AddProblemToListDialog } from "@/components/lists/add-problem-to-list-dialog"
import { ProblemTable } from "@/components/problems/problem-table"
import { useProblemList, useProblemListProblems, useRemoveProblemFromList } from "@/hooks/use-lists"
import { useNotes } from "@/hooks/use-notes"
import { useEnrollReview, useRemoveReview } from "@/hooks/use-reviews"
import { getListDisplayName } from "@/lib/list-display"
import { getNewNoteHref, getNoteHref } from "@/lib/note-display"
import type { ProblemFilters as Filters, ProblemSummaryDto } from "@/lib/types"
import styles from "./list-detail.module.css"

const PAGE_SIZE = 20
const DEFAULT_FILTERS: Filters = { page: 0, size: PAGE_SIZE, sort: "createdDate,desc" }

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

export default function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id: rawId } = use(params)
  const id = Number(rawId)
  const { data: list, isLoading } = useProblemList(id)
  const storageKey = useMemo(() => `leetly:list:${id}:filters`, [id])
  const [filters, setFilters] = useState<Filters>(() => readStoredFilters(`leetly:list:${id}:filters`))
  const { data: pagedResponse, error, isError, isLoading: isProblemsLoading } = useProblemListProblems(id, filters)
  const removeMutation = useRemoveProblemFromList()
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

  const problems = pagedResponse?.content ?? []
  const page = pagedResponse?.page ?? 0
  const totalPages = pagedResponse?.totalPages ?? 1
  const totalElements = pagedResponse?.totalElements ?? 0

  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem(storageKey, JSON.stringify(filters))
  }, [filters, storageKey])

  function handleChange(partial: Partial<Filters>) {
    setFilters((current) => ({ ...current, ...partial }))
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS)
  }

  function handleNoteClick(problem: ProblemSummaryDto) {
    const returnTo = `/lists/${id}`
    const noteId = noteIdsByProblemId.get(problem.id)
    router.push(
      noteId
        ? getNoteHref(noteId, returnTo)
        : getNewNoteHref({ problemId: problem.id, title: problem.title, returnTo }),
    )
  }

  async function handleRemoveProblem(problem: ProblemSummaryDto) {
    try {
      await removeMutation.mutateAsync({ listId: id, problemId: problem.id })
      toast.success("Problem removed from list")
    } catch {
      toast.error("Failed to remove problem")
    }
  }

  if (isLoading) {
    return (
      <div className={styles.skeletons}>
        <Skeleton className={styles.skeletonTitle} />
        <Skeleton className={styles.skeletonBody} />
      </div>
    )
  }

  if (!list) {
    return <div className={styles.notFound}>List not found.</div>
  }

  const displayListName = getListDisplayName(list)

  return (
    <div className={styles.page}>
      <Button variant="ghost" size="sm" asChild className={styles.back}>
        <Link href="/lists">
          <ArrowLeft size={16} />
          Back
        </Link>
      </Button>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{displayListName}</h1>
          <p className={styles.subtitle}>
            {totalElements} problem{totalElements !== 1 ? "s" : ""}
          </p>
        </div>
        <AddProblemToListDialog
          listId={list.id}
          listName={displayListName}
          listProblemIds={list.problems.map((problem) => problem.id)}
        />
      </div>

      <ProblemFilters filters={filters} onChange={handleChange} onReset={handleReset} />

      {isError ? (
        <div className={styles.error}>
          <AlertCircle size={16} className={styles.errorIcon} aria-hidden="true" />
          <div>
            <p className={styles.errorTitle}>Failed to load problems.</p>
            <p>{error instanceof Error ? error.message : "Unexpected error"}</p>
          </div>
        </div>
      ) : null}

      <div className={styles.tableShell}>
        <ProblemTable
          problems={problems}
          isLoading={isProblemsLoading && !pagedResponse}
          pageSize={PAGE_SIZE}
          onNoteClick={handleNoteClick}
          onDelete={handleRemoveProblem}
          notedProblemIds={new Set(noteIdsByProblemId.keys())}
          onEnrollReview={(p) => enrollReviewMutation.mutate(p.id)}
          onRemoveReview={(_problemId, cardId) => removeReviewMutation.mutate(cardId)}
        />
      </div>

      {totalPages > 1 && !isError ? (
        <div className={styles.pager}>
          <p className={styles.pagerStatus}>
            Page {page + 1} of {totalPages}
          </p>
          <div className={styles.pagerButtons}>
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => handleChange({ page: page - 1 })}>
              <ChevronLeft size={16} />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => handleChange({ page: page + 1 })}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
