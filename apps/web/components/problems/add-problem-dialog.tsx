"use client"

import { useEffect, useRef, useState } from "react"
import { ExternalLink, Loader2, Plus } from "lucide-react"
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
  onAdd: (problem: Omit<ProblemSummaryDto, "id" | "status">) => void
}

export function AddProblemDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "fetched" | "error">("idle")
  const [preview, setPreview] = useState<FetchedProblem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function reset() {
    setInput("")
    setStatus("idle")
    setPreview(null)
    setError(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!input.trim() || !parseInput(input)) {
      setStatus("idle")
      setPreview(null)
      setError(null)
      return
    }
    setStatus("loading")
    setPreview(null)
    setError(null)
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await fetchProblem(input)
        setPreview(result)
        setStatus("fetched")
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch problem")
        setStatus("error")
      }
    }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [input])

  function handleAdd() {
    if (!preview) return
    onAdd(preview)
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          New Problem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Problem</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="problem-input">LeetCode ID or URL</Label>
            <div className="relative">
              <Input
                id="problem-input"
                placeholder="e.g. 42 or leetcode.com/problems/two-sum/"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={status === "loading" ? "pr-8" : ""}
              />
              {status === "loading" && (
                <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          {preview && (
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
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setOpen(false); reset() }}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!preview}>
              Add Problem
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
