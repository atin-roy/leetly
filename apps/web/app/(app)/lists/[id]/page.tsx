"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AddProblemToListDialog } from "@/components/lists/add-problem-to-list-dialog"
import { ProblemTable } from "@/components/problems/problem-table"
import { useProblemList, useRemoveProblemFromList } from "@/hooks/use-lists"
import { useProblems } from "@/hooks/use-problems"
import type { ProblemSummaryDto } from "@/lib/types"

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
        <AddProblemToListDialog
          listId={list.id}
          listName={list.name}
          listProblemIds={list.problems.map((problem) => problem.id)}
          problems={allProblems?.content ?? []}
        />
      </div>
      <Card>
        <CardContent className="p-0">
          <ProblemTable problems={list.problems} onDelete={handleRemoveProblem} />
        </CardContent>
      </Card>
    </div>
  )
}
