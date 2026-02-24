"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ProblemFilters } from "@/components/problems/problem-filters"
import { ProblemTable } from "@/components/problems/problem-table"
import { AddProblemDialog } from "@/components/problems/add-problem-dialog"
import { NoteEditorDialog } from "@/components/notes/note-editor-dialog"
import { useProblems, useInvalidateProblem } from "@/hooks/use-problems"
import { useCreateNote } from "@/hooks/use-notes"
import type { NoteDto, NoteTag, ProblemFilters as Filters, ProblemSummaryDto } from "@/lib/types"

const PAGE_SIZE = 20
const DEFAULT_FILTERS: Filters = { page: 0, size: PAGE_SIZE }

export default function ProblemsPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const { data: pagedResponse, isLoading } = useProblems(filters)
  const invalidate = useInvalidateProblem()
  const createNoteMutation = useCreateNote()

  const [problemNotes, setProblemNotes] = useState<Record<number, NoteDto>>({})
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [selectedProblem, setSelectedProblem] = useState<ProblemSummaryDto | undefined>()

  const problems = pagedResponse?.content ?? []
  const page = pagedResponse?.page ?? 0
  const totalPages = pagedResponse?.totalPages ?? 1
  const totalElements = pagedResponse?.totalElements ?? 0

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
      const note = await createNoteMutation.mutateAsync({
        problemId: selectedProblem.id,
        tag,
        title,
        content,
      })
      setProblemNotes((prev) => ({ ...prev, [selectedProblem.id]: note }))
    } catch {
      // Error handled by mutation
    }
  }

  function handleAdd(p: Omit<ProblemSummaryDto, "id" | "status">): ProblemSummaryDto {
    // The AddProblemDialog will use the API to create the problem;
    // we just need to invalidate the problems list afterwards
    const created: ProblemSummaryDto = { ...p, id: Date.now(), status: "UNSEEN" }
    invalidate(0)
    return created
  }

  const existingProblems = new Map(problems.map((p) => [p.leetcodeId, p.id]))

  if (isLoading) {
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
            onDelete={() => invalidate(0)}
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
    </div>
  )
}
