"use client"

import { use, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ProblemTable } from "@/components/problems/problem-table"
import { useProblemList, useAddProblemToList, useRemoveProblemFromList } from "@/hooks/use-lists"
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
  const addMutation = useAddProblemToList()
  const removeMutation = useRemoveProblemFromList()
  const { data: allProblems } = useProblems({ size: 200 })
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  async function handleAddProblem(problemId: number) {
    try {
      await addMutation.mutateAsync({ listId: id, problemId })
      toast.success("Problem added to list")
      setAddDialogOpen(false)
    } catch {
      toast.error("Failed to add problem")
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
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Problem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Problem to List</DialogTitle>
            </DialogHeader>
            <Select
              onValueChange={(v) => handleAddProblem(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a problem..." />
              </SelectTrigger>
              <SelectContent>
                {allProblems?.content
                  ?.filter((p) => !list.problems.some((lp) => lp.id === p.id))
                  .map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      #{p.leetcodeId} {p.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <ProblemTable problems={list.problems} onDelete={handleRemoveProblem} />
        </CardContent>
      </Card>
    </div>
  )
}
