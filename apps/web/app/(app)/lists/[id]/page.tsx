"use client"

import { use, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AddProblemToListDialog } from "@/components/lists/add-problem-to-list-dialog"
import { ProblemTable } from "@/components/problems/problem-table"
import { useProblemList, useRemoveProblemFromList } from "@/hooks/use-lists"
import { useProblems } from "@/hooks/use-problems"
import type { ProblemSummaryDto } from "@/lib/types"

const LIST_SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "leetcodeId", label: "ID" },
  { value: "title", label: "Name" },
  { value: "difficulty", label: "Difficulty" },
  { value: "lastAttemptedAt", label: "Recently Attempted" },
] as const

type ListSortKey = (typeof LIST_SORT_OPTIONS)[number]["value"]

const DIFFICULTY_ORDER = { EASY: 0, MEDIUM: 1, HARD: 2 } as const

function sortProblems(problems: ProblemSummaryDto[], sortKey: ListSortKey): ProblemSummaryDto[] {
  if (sortKey === "default") return problems
  return [...problems].sort((a, b) => {
    switch (sortKey) {
      case "leetcodeId":
        return a.leetcodeId - b.leetcodeId
      case "title":
        return a.title.localeCompare(b.title)
      case "difficulty":
        return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]
      case "lastAttemptedAt": {
        if (!a.lastAttemptedAt && !b.lastAttemptedAt) return 0
        if (!a.lastAttemptedAt) return 1
        if (!b.lastAttemptedAt) return -1
        return b.lastAttemptedAt.localeCompare(a.lastAttemptedAt)
      }
      default:
        return 0
    }
  })
}

export default function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: rawId } = use(params)
  const id = Number(rawId)
  const { data: list, isLoading } = useProblemList(id)
  const removeMutation = useRemoveProblemFromList()
  const { data: allProblems } = useProblems({ size: 200 })
  const [sortKey, setSortKey] = useState<ListSortKey>("default")

  const sortedProblems = useMemo(
    () => (list ? sortProblems(list.problems, sortKey) : []),
    [list, sortKey],
  )

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
          <h1 className="text-2xl font-semibold tracking-tight">{list.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {list.problems.length} problem{list.problems.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as ListSortKey)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {LIST_SORT_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AddProblemToListDialog
            listId={list.id}
            listName={list.name}
            listProblemIds={list.problems.map((problem) => problem.id)}
            problems={allProblems?.content ?? []}
          />
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <ProblemTable problems={sortedProblems} onDelete={handleRemoveProblem} />
        </CardContent>
      </Card>
    </div>
  )
}
