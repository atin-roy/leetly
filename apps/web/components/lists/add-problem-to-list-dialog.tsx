"use client"

import { useMemo, useRef, useState, type ChangeEvent } from "react"
import Link from "next/link"
import { AlertCircle, ArrowRight, ExternalLink, Loader2, Plus, Upload } from "lucide-react"
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
import { getListDisplayNameFromName } from "@/lib/list-display"
import { useAddProblemToList } from "@/hooks/use-lists"
import { useCreateProblem } from "@/hooks/use-problems"
import type { CreateProblemRequest, ProblemSummaryDto } from "@/lib/types"

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
  const [newProblemInput, setNewProblemInput] = useState("")
  const [fetchStatus, setFetchStatus] = useState<"idle" | "loading" | "fetched" | "error">("idle")
  const [preview, setPreview] = useState<FetchedProblem | null>(null)
  const [newProblemError, setNewProblemError] = useState<string | null>(null)
  const [isImportingCsv, setIsImportingCsv] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const csvInputRef = useRef<HTMLInputElement | null>(null)

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

  function extractCsvRows(csv: string) {
    return csv
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) =>
        line
          .split(",")
          .map((cell) => cell.trim().replace(/^"(.*)"$/, "$1")),
      )
  }

  function extractProblemInputFromRow(row: string[], headerMap?: Map<string, number>) {
    const normalizedRow = row.map((cell) => cell.trim()).filter(Boolean)
    if (normalizedRow.length === 0) return null

    const byHeader = (keys: string[]) => {
      if (!headerMap) return null
      for (const key of keys) {
        const index = headerMap.get(key)
        if (index == null) continue
        const value = row[index]?.trim()
        if (value) return value
      }
      return null
    }

    const preferred =
      byHeader(["url", "link", "leetcode_url"]) ??
      byHeader(["id", "leetcode_id", "problem_id", "number"])
    if (preferred) return preferred

    return normalizedRow.find((cell) => parseProblemInput(cell)) ?? null
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

  async function handleCsvUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    try {
      setIsImportingCsv(true)
      const csv = await file.text()
      const rows = extractCsvRows(csv)
      if (rows.length === 0) {
        toast.error("CSV file is empty")
        return
      }

      const normalizedHeader = rows[0].map((cell) => cell.trim().toLowerCase())
      const hasHeader = normalizedHeader.some((cell) =>
        ["id", "leetcode_id", "problem_id", "number", "url", "link", "leetcode_url"].includes(cell),
      )
      const headerMap = hasHeader
        ? new Map(normalizedHeader.map((cell, index) => [cell, index]))
        : undefined
      const dataRows = hasHeader ? rows.slice(1) : rows

      const inputs = dataRows
        .map((row) => extractProblemInputFromRow(row, headerMap))
        .filter((value): value is string => Boolean(value))

      if (inputs.length === 0) {
        toast.error("No valid LeetCode ids or URLs found in the CSV")
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
          failures.push(
            error instanceof Error ? `${normalizedInput}: ${error.message}` : `${normalizedInput}: failed`,
          )
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
        toast.error(`Failed to import ${failures.length} row${failures.length === 1 ? "" : "s"}`)
      }

      if (!createdCount && !linkedCount && !failures.length) {
        toast.message("Nothing new to import")
      }
    } finally {
      setIsImportingCsv(false)
    }
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

  async function handleCreateAndAdd(problem: CreateProblemRequest) {
    try {
      const created = await createProblemMutation.mutateAsync(problem)
      await addMutation.mutateAsync({
        listId,
        problemId: created.id,
      })
      toast.success(`Problem added to ${displayListName}`)
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
          <DialogTitle>Add Problem to {displayListName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Paste a LeetCode number or URL. If the problem already exists, it will be linked to this list. If not, it will be created and added here.
          </p>

          <div className="rounded-lg border border-dashed p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Bulk import from CSV</p>
                <p className="text-xs text-muted-foreground">
                  Upload a CSV with LeetCode ids, URLs, or both. Each row is processed like manual add.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(event) => void handleCsvUpload(event)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => csvInputRef.current?.click()}
                  disabled={isImportingCsv || createProblemMutation.isPending || addMutation.isPending}
                >
                  {isImportingCsv ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload CSV
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

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
                      {duplicateIsInList ? "Already in this list" : "Already in All Problems"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{preview.title}</span>
                      {duplicateIsInList
                        ? " is already in this list."
                        : " is already tracked in All Problems and will be linked here."}
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
              disabled={!preview || duplicateIsInList || createProblemMutation.isPending || addMutation.isPending || isImportingCsv}
            >
              {createProblemMutation.isPending || addMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : duplicateId !== undefined ? (
                "Link Existing Problem"
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
