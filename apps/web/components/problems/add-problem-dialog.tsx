"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { AlertCircle, ArrowRight, CheckCircle2, ExternalLink, Loader2, Plus, RotateCcw } from "lucide-react"
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
import { DifficultyBadge } from "./difficulty-badge"
import type { Difficulty, ProblemSummaryDto } from "@/lib/types"

interface FetchedProblem {
  leetcodeId: number
  title: string
  difficulty: Difficulty
  url: string
}

function parseInput(input: string): { param: "id" | "slug"; value: string } | null {
  const t = input.trim()
  if (/^\d+$/.test(t)) return { param: "id", value: t }
  const m = t.match(/leetcode\.com\/problems\/([\w-]+)/i)
  if (m) return { param: "slug", value: m[1] }
  return null
}

async function fetchProblem(input: string): Promise<FetchedProblem> {
  const parsed = parseInput(input)
  if (!parsed) throw new Error("Enter a valid problem number or LeetCode URL")
  const res = await fetch(`/api/leetcode?${parsed.param}=${parsed.value}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? "Failed to fetch problem")
  return data
}

interface Props {
  onAdd: (problem: Omit<ProblemSummaryDto, "id" | "status">) => ProblemSummaryDto
  /** Maps leetcodeId → internal problem id for duplicate detection */
  existingProblems: Map<number, number>
}

export function AddProblemDialog({ onAdd, existingProblems }: Props) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"form" | "added">("form")
  const [input, setInput] = useState("")
  const [fetchStatus, setFetchStatus] = useState<"idle" | "loading" | "fetched" | "error">("idle")
  const [preview, setPreview] = useState<FetchedProblem | null>(null)
  const [added, setAdded] = useState<ProblemSummaryDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function resetForm() {
    setInput("")
    setFetchStatus("idle")
    setPreview(null)
    setError(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  function resetAll() {
    resetForm()
    setStep("form")
    setAdded(null)
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!input.trim() || !parseInput(input)) {
      setFetchStatus("idle")
      setPreview(null)
      setError(null)
      return
    }
    setFetchStatus("loading")
    setPreview(null)
    setError(null)
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await fetchProblem(input)
        setPreview(result)
        setFetchStatus("fetched")
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch problem")
        setFetchStatus("error")
      }
    }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [input])

  const duplicateId = preview ? existingProblems.get(preview.leetcodeId) : undefined
  const isDuplicate = duplicateId !== undefined

  function handleAdd() {
    if (!preview || isDuplicate) return
    const created = onAdd(preview)
    setAdded(created)
    setStep("added")
  }

  function handleTrackAnother() {
    resetForm()
    setAdded(null)
    setStep("form")
  }

  function handleClose() {
    setOpen(false)
    resetAll()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetAll() }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          New Problem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Track a Problem</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="problem-input">LeetCode number or URL</Label>
                <div className="relative">
                  <Input
                    id="problem-input"
                    placeholder="e.g. 42 or leetcode.com/problems/two-sum/"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className={fetchStatus === "loading" ? "pr-8" : ""}
                  />
                  {fetchStatus === "loading" && (
                    <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>

              {preview && (
                isDuplicate ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3 dark:border-amber-800 dark:bg-amber-950/30">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Already in your list</p>
                        <p className="text-xs text-muted-foreground">
                          You&apos;re already tracking{" "}
                          <span className="font-medium text-foreground">{preview.title}</span>
                        </p>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline" className="w-full" onClick={handleClose}>
                      <Link href={`/problems/${duplicateId}`}>
                        <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
                        Go to problem
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground mb-1">
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
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={!preview || isDuplicate}>
                  Add to My Problems
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Problem Added</DialogTitle>
            </DialogHeader>

            <div className="space-y-5 pt-2">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                <div className="min-w-0">
                  <p className="font-medium leading-snug truncate">{added?.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    #{added?.leetcodeId} · {added?.difficulty}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href={`/problems/${added?.id}`} onClick={handleClose}>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Open Problem
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleTrackAnother}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Track Another
                </Button>
                <Button variant="ghost" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
