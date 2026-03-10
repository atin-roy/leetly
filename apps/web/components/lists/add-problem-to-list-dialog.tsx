"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { AlertCircle, ArrowRight, ExternalLink, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DifficultyBadge } from "@/components/problems/difficulty-badge"
import { fetchLeetCodeProblem, parseProblemInput, type FetchedProblem } from "@/lib/leetcode"
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
  const [open, setOpen] = useState(false)
  const [newProblemInput, setNewProblemInput] = useState("")
  const [fetchStatus, setFetchStatus] = useState<"idle" | "loading" | "fetched" | "error">("idle")
  const [preview, setPreview] = useState<FetchedProblem | null>(null)
  const [newProblemError, setNewProblemError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const existingProblems = useMemo(
    () => new Map(problems.map((problem) => [problem.leetcodeId, problem.id])),
    [problems]
  )
  const duplicateId = preview ? existingProblems.get(preview.leetcodeId) : undefined
  const duplicateIsInList = duplicateId !== undefined && listProblemIds.includes(duplicateId)

  function resetNewProblemForm() {
    setNewProblemInput("")
    setFetchStatus("idle")
    setPreview(null)
    setNewProblemError(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  function handleNewProblemInputChange(value: string) {
    setNewProblemInput(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim() || !parseProblemInput(value)) {
      setFetchStatus("idle")
      setPreview(null)
      setNewProblemError(null)
      return
    }

    setFetchStatus("loading")
    setPreview(null)
    setNewProblemError(null)

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await fetchLeetCodeProblem(value)
        setPreview(result)
        setFetchStatus("fetched")
      } catch (e) {
        setNewProblemError(e instanceof Error ? e.message : "Failed to fetch problem")
        setFetchStatus("error")
      }
    }, 500)
  }

  async function handleCreateAndAdd(problem: Omit<ProblemSummaryDto, "id" | "status" | "lastAttemptedAt">) {
    try {
      const created = await createProblemMutation.mutateAsync(problem)
      await addMutation.mutateAsync({
        listId,
        problemId: created.id,
      })
      toast.success(`Problem added to ${listName} and My Problems`)
      setOpen(false)
      resetNewProblemForm()
      return created
    } catch {
      setNewProblemError("Failed to add problem")
      throw new Error("Failed to add problem")
    }
  }

  async function handleAddTrackedProblem() {
    if (duplicateId === undefined) return

    try {
      await addMutation.mutateAsync({
        listId,
        problemId: duplicateId,
      })
      toast.success("Problem added to list")
      setOpen(false)
      resetNewProblemForm()
    } catch {
      setNewProblemError("Failed to add problem")
    }
  }

  async function handleSubmit() {
    if (!preview) return

    if (duplicateId !== undefined) {
      await handleAddTrackedProblem()
      return
    }

    await handleCreateAndAdd(preview)
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
          <DialogTitle>Add Problem to {listName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Paste a LeetCode number or URL. If the problem already exists, it will be linked to this list. If not, it will be created in My Problems and added here.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="list-problem-input">LeetCode number or URL</Label>
            <div className="relative">
              <Input
                id="list-problem-input"
                placeholder="e.g. 42 or leetcode.com/problems/two-sum/"
                value={newProblemInput}
                onChange={(e) => handleNewProblemInputChange(e.target.value)}
                className={fetchStatus === "loading" ? "pr-8" : ""}
              />
              {fetchStatus === "loading" && (
                <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {newProblemError && <p className="text-xs text-destructive">{newProblemError}</p>}
          </div>

          {preview && (
            duplicateId !== undefined ? (
              <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      {duplicateIsInList ? "Already in this list" : "Already in My Problems"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{preview.title}</span>
                      {duplicateIsInList
                        ? " is already in this list."
                        : " is already tracked in My Problems and will be linked here."}
                    </p>
                  </div>
                </div>
                {duplicateIsInList && (
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href={`/problems/${duplicateId}`} onClick={() => setOpen(false)}>
                      <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
                      Open Problem
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="mb-1 font-mono text-xs text-muted-foreground">
                      #{preview.leetcodeId}
                    </p>
                    <p className="font-medium leading-snug">{preview.title}</p>
                  </div>
                  <DifficultyBadge difficulty={preview.difficulty} />
                </div>
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on LeetCode
                </a>
              </div>
            )
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={!preview || duplicateIsInList || createProblemMutation.isPending || addMutation.isPending}
            >
              {createProblemMutation.isPending || addMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : duplicateId !== undefined ? (
                "Link Existing Problem"
              ) : (
                `Add to ${listName} and My Problems`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
