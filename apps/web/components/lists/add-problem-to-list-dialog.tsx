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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAddProblemToList } from "@/hooks/use-lists"
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
  const [open, setOpen] = useState(false)
  const [selectedProblemId, setSelectedProblemId] = useState<string>("")

  const availableProblems = useMemo(
    () => problems.filter((problem) => !listProblemIds.includes(problem.id)),
    [listProblemIds, problems]
  )

  async function handleAdd() {
    if (!selectedProblemId) return

    try {
      await addMutation.mutateAsync({
        listId,
        problemId: Number(selectedProblemId),
      })
      toast.success("Problem added to list")
      setSelectedProblemId("")
      setOpen(false)
    } catch {
      toast.error("Failed to add problem")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setSelectedProblemId("")
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant={buttonVariant}
          className={buttonClassName}
          disabled={!availableProblems.length}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Problem
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Problem to {listName}</DialogTitle>
        </DialogHeader>
        {availableProblems.length ? (
          <div className="space-y-4">
            <Select value={selectedProblemId} onValueChange={setSelectedProblemId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a problem..." />
              </SelectTrigger>
              <SelectContent>
                {availableProblems.map((problem) => (
                  <SelectItem key={problem.id} value={String(problem.id)}>
                    #{problem.leetcodeId} {problem.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={!selectedProblemId || addMutation.isPending}>
                {addMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Problem"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            All of your tracked problems are already in this list.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
