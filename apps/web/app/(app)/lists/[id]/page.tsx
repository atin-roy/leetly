"use client"

import { use, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { ProblemFilters } from "@/components/problems/problem-filters"
import { Skeleton } from "@/components/ui/skeleton"
import { AddProblemToListDialog } from "@/components/lists/add-problem-to-list-dialog"
import { ProblemTable } from "@/components/problems/problem-table"
import { NoteEditorDialog } from "@/components/notes/note-editor-dialog"
import { useProblemList, useProblemListProblems, useRemoveProblemFromList } from "@/hooks/use-lists"
import { useProblems } from "@/hooks/use-problems"
import { useCreateNote, useNotes } from "@/hooks/use-notes"
import { useEnrollReview, useRemoveReview } from "@/hooks/use-reviews"
import { getListDisplayName } from "@/lib/list-display"
import type { NoteTag, ProblemFilters as Filters, ProblemSummaryDto } from "@/lib/types"

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
  const { id: rawId } = use(params)
  const id = Number(rawId)
  const { data: list, isLoading } = useProblemList(id)
  const storageKey = useMemo(() => `leetly:list:${id}:filters`, [id])
  const [filters, setFilters] = useState<Filters>(() => readStoredFilters(`leetly:list:${id}:filters`))
  const { data: pagedResponse, error, isError, isLoading: isProblemsLoading } = useProblemListProblems(id, filters)
  const removeMutation = useRemoveProblemFromList()
  const createNoteMutation = useCreateNote()
  const enrollReviewMutation = useEnrollReview()
  const removeReviewMutation = useRemoveReview()
  const { data: notesData } = useNotes({ size: 200 })
  const { data: allProblems } = useProblems({ size: 200 })
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [selectedProblem, setSelectedProblem] = useState<ProblemSummaryDto | undefined>()

  const notedProblemIds = useMemo(() => {
    const ids = new Set<number>()
    if (notesData?.content) {
      for (const n of notesData.content) {
        if (n.problemId != null) {
          ids.add(n.problemId)
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
    setSelectedProblem(problem)
    setNoteDialogOpen(true)
  }

  async function handleNoteSave({ tag, title, content }: { tag: NoteTag; title: string; content: string }) {
    if (!selectedProblem || !title.trim() || !content.trim()) return
    try {
      await createNoteMutation.mutateAsync({
        problemId: selectedProblem.id,
        tag,
        title,
        content,
      })
      setNoteDialogOpen(false)
    } catch {
      // Error handled by mutation
    }
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
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!list) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        List not found.
      </div>
    )
  }

  const displayListName = getListDisplayName(list)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/lists">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{displayListName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalElements} problem{totalElements !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddProblemToListDialog
            listId={list.id}
            listName={displayListName}
            listProblemIds={list.problems.map((problem) => problem.id)}
            problems={allProblems?.content ?? []}
          />
        </div>
      </div>
      <ProblemFilters
        filters={filters}
        onChange={handleChange}
        onReset={handleReset}
      />
      {isError ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-6 text-sm text-muted-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
            <div>
              <p className="font-medium text-foreground">Failed to load problems.</p>
              <p>{error instanceof Error ? error.message : "Unexpected error"}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardContent className="p-0">
          <ProblemTable
            problems={problems}
            isLoading={isProblemsLoading && !pagedResponse}
            pageSize={PAGE_SIZE}
            onNoteClick={handleNoteClick}
            onDelete={handleRemoveProblem}
            notedProblemIds={notedProblemIds}
            onEnrollReview={(p) => enrollReviewMutation.mutate(p.id)}
            onRemoveReview={(_problemId, cardId) => removeReviewMutation.mutate(cardId)}
          />
        </CardContent>
      </Card>
      {totalPages > 1 && !isError ? (
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
      ) : null}
      <NoteEditorDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        initialMode="edit"
        defaultTitle={selectedProblem?.title}
        onSave={handleNoteSave}
      />
    </div>
  )
}
