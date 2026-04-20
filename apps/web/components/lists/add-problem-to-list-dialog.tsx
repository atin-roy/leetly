"use client"

import { useMemo, useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fetchLeetCodeProblem, parseProblemInput } from "@/lib/leetcode"
import { getListDisplayNameFromName } from "@/lib/list-display"
import { useAddProblemToList } from "@/hooks/use-lists"
import { useCreateProblem } from "@/hooks/use-problems"
import type { ProblemSummaryDto } from "@/lib/types"

interface AddProblemToListDialogProps {
  listId: number
  listName: string
  listProblemIds: number[]
  problems: ProblemSummaryDto[]
  buttonVariant?: "default" | "outline" | "secondary" | "ghost"
  buttonClassName?: string
}

export function AddProblemToListDialog({
  listId,
  listName,
  listProblemIds,
  problems,
  buttonVariant = "default",
  buttonClassName,
}: AddProblemToListDialogProps) {
  const addMutation = useAddProblemToList()
  const createProblemMutation = useCreateProblem()
  const displayListName = getListDisplayNameFromName(listName)
  const [open, setOpen] = useState(false)
  const [problemInputs, setProblemInputs] = useState("")
  const [isImportingBulk, setIsImportingBulk] = useState(false)

  const existingProblems = useMemo(
    () => new Map(problems.map((problem) => [problem.leetcodeId, problem.id])),
    [problems]
  )

  function resetNewProblemForm() {
    setProblemInputs("")
  }

  function extractBulkProblemInputs(value: string) {
    return value
      .split(/[,\n]/)
      .map((input) => input.trim())
      .filter((input) => parseProblemInput(input))
  }

  async function ensureProblemInList(
    problemInput: string,
    currentProblemsByLeetcodeId: Map<number, number>,
    currentListProblemIds: Set<number>,
  ) {
    const fetched = await fetchLeetCodeProblem(problemInput)
    const existingProblemId = currentProblemsByLeetcodeId.get(fetched.leetcodeId)

    if (existingProblemId != null) {
      if (currentListProblemIds.has(existingProblemId)) {
        return "skipped"
      }
      await addMutation.mutateAsync({ listId, problemId: existingProblemId })
      currentListProblemIds.add(existingProblemId)
      return "linked"
    }

    const created = await createProblemMutation.mutateAsync(fetched)
    currentProblemsByLeetcodeId.set(created.leetcodeId, created.id)
    currentListProblemIds.add(created.id)
    await addMutation.mutateAsync({ listId, problemId: created.id })
    return "created"
  }

  async function handleBulkImport() {
    try {
      setIsImportingBulk(true)
      const inputs = extractBulkProblemInputs(problemInputs)

      if (inputs.length === 0) {
        toast.error("Enter at least one valid LeetCode id or URL")
        return
      }

      const currentProblemsByLeetcodeId = new Map(existingProblems)
      const currentListProblemIds = new Set(listProblemIds)
      const seenInputs = new Set<string>()
      let createdCount = 0
      let linkedCount = 0
      let skippedCount = 0
      const failures: string[] = []

      for (const rawInput of inputs) {
        const normalizedInput = rawInput.trim()
        if (!normalizedInput || seenInputs.has(normalizedInput)) {
          skippedCount += 1
          continue
        }
        seenInputs.add(normalizedInput)

        try {
          const result = await ensureProblemInList(
            normalizedInput,
            currentProblemsByLeetcodeId,
            currentListProblemIds,
          )
          if (result === "created") {
            createdCount += 1
          } else if (result === "linked") {
            linkedCount += 1
          } else {
            skippedCount += 1
          }
        } catch (error) {
          failures.push(error instanceof Error ? error.message : "failed")
        }
      }

      if (createdCount || linkedCount) {
        toast.success(
          `Imported ${createdCount + linkedCount} problem${createdCount + linkedCount === 1 ? "" : "s"} (${createdCount} new, ${linkedCount} linked${skippedCount ? `, ${skippedCount} skipped` : ""})`,
        )
        setOpen(false)
        resetNewProblemForm()
      }

      if (failures.length > 0) {
        toast.error(`Failed to import ${failures.length} value${failures.length === 1 ? "" : "s"}`)
      }

      if (!createdCount && !linkedCount && !failures.length) {
        toast.message("Nothing new to import")
      }
    } finally {
      setIsImportingBulk(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          resetNewProblemForm()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant={buttonVariant}
          className={buttonClassName}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Problem
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Problem to {displayListName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="list-problem-input">LeetCode numbers or URLs</Label>
            <Textarea
              id="list-problem-input"
              value={problemInputs}
              onChange={(event) => setProblemInputs(event.target.value)}
              placeholder="e.g. 1, 42, leetcode.com/problems/two-sum/"
              rows={4}
              disabled={isImportingBulk || createProblemMutation.isPending || addMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Use commas or new lines. Existing problems will be linked to this list; new ones will be created.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleBulkImport()}
              disabled={
                !problemInputs.trim() ||
                isImportingBulk ||
                createProblemMutation.isPending ||
                addMutation.isPending
              }
            >
              {isImportingBulk || createProblemMutation.isPending || addMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                `Add to ${displayListName}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
