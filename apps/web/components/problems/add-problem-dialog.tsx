"use client"

import { useState } from "react"
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

// TODO: replace with real fetch from backend (which calls LeetCode API)
const KNOWN_PROBLEMS: Record<number, { title: string; difficulty: Difficulty; slug: string }> = {
  1: { title: "Two Sum", difficulty: "EASY", slug: "two-sum" },
  2: { title: "Add Two Numbers", difficulty: "MEDIUM", slug: "add-two-numbers" },
  3: { title: "Longest Substring Without Repeating Characters", difficulty: "MEDIUM", slug: "longest-substring-without-repeating-characters" },
  4: { title: "Median of Two Sorted Arrays", difficulty: "HARD", slug: "median-of-two-sorted-arrays" },
  5: { title: "Longest Palindromic Substring", difficulty: "MEDIUM", slug: "longest-palindromic-substring" },
  11: { title: "Container With Most Water", difficulty: "MEDIUM", slug: "container-with-most-water" },
  15: { title: "3Sum", difficulty: "MEDIUM", slug: "3sum" },
  20: { title: "Valid Parentheses", difficulty: "EASY", slug: "valid-parentheses" },
  21: { title: "Merge Two Sorted Lists", difficulty: "EASY", slug: "merge-two-sorted-lists" },
  42: { title: "Trapping Rain Water", difficulty: "HARD", slug: "trapping-rain-water" },
  53: { title: "Maximum Subarray", difficulty: "MEDIUM", slug: "maximum-subarray" },
  70: { title: "Climbing Stairs", difficulty: "EASY", slug: "climbing-stairs" },
  76: { title: "Minimum Window Substring", difficulty: "HARD", slug: "minimum-window-substring" },
  84: { title: "Largest Rectangle in Histogram", difficulty: "HARD", slug: "largest-rectangle-in-histogram" },
  98: { title: "Validate Binary Search Tree", difficulty: "MEDIUM", slug: "validate-binary-search-tree" },
  121: { title: "Best Time to Buy and Sell Stock", difficulty: "EASY", slug: "best-time-to-buy-and-sell-stock" },
  124: { title: "Binary Tree Maximum Path Sum", difficulty: "HARD", slug: "binary-tree-maximum-path-sum" },
  139: { title: "Word Break", difficulty: "MEDIUM", slug: "word-break" },
  141: { title: "Linked List Cycle", difficulty: "EASY", slug: "linked-list-cycle" },
  146: { title: "LRU Cache", difficulty: "MEDIUM", slug: "lru-cache" },
  152: { title: "Maximum Product Subarray", difficulty: "MEDIUM", slug: "maximum-product-subarray" },
  153: { title: "Find Minimum in Rotated Sorted Array", difficulty: "MEDIUM", slug: "find-minimum-in-rotated-sorted-array" },
  200: { title: "Number of Islands", difficulty: "MEDIUM", slug: "number-of-islands" },
  206: { title: "Reverse Linked List", difficulty: "EASY", slug: "reverse-linked-list" },
  217: { title: "Contains Duplicate", difficulty: "EASY", slug: "contains-duplicate" },
  226: { title: "Invert Binary Tree", difficulty: "EASY", slug: "invert-binary-tree" },
  238: { title: "Product of Array Except Self", difficulty: "MEDIUM", slug: "product-of-array-except-self" },
  295: { title: "Find Median from Data Stream", difficulty: "HARD", slug: "find-median-from-data-stream" },
  300: { title: "Longest Increasing Subsequence", difficulty: "MEDIUM", slug: "longest-increasing-subsequence" },
  322: { title: "Coin Change", difficulty: "MEDIUM", slug: "coin-change" },
  394: { title: "Decode String", difficulty: "MEDIUM", slug: "decode-string" },
  424: { title: "Longest Repeating Character Replacement", difficulty: "MEDIUM", slug: "longest-repeating-character-replacement" },
  739: { title: "Daily Temperatures", difficulty: "MEDIUM", slug: "daily-temperatures" },
}

const SLUG_TO_ID = Object.fromEntries(
  Object.entries(KNOWN_PROBLEMS).map(([id, p]) => [p.slug, Number(id)])
)

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

interface FetchedProblem {
  leetcodeId: number
  title: string
  difficulty: Difficulty
  url: string
}

function parseInput(input: string): { leetcodeId: number; slug?: string } | null {
  const trimmed = input.trim()
  if (/^\d+$/.test(trimmed)) {
    return { leetcodeId: parseInt(trimmed, 10) }
  }
  const urlMatch = trimmed.match(/leetcode\.com\/problems\/([\w-]+)/i)
  if (urlMatch) {
    const slug = urlMatch[1]
    const id = SLUG_TO_ID[slug] ?? 0
    return { leetcodeId: id, slug }
  }
  return null
}

function simulateFetch(input: string): Promise<FetchedProblem> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const parsed = parseInput(input)
      if (!parsed) {
        reject(new Error("Enter a valid problem number or LeetCode URL"))
        return
      }
      const { leetcodeId, slug } = parsed
      const known = KNOWN_PROBLEMS[leetcodeId]
      if (known) {
        resolve({
          leetcodeId,
          title: known.title,
          difficulty: known.difficulty,
          url: `https://leetcode.com/problems/${known.slug}/`,
        })
        return
      }
      // Unknown problem — derive title from slug or ID
      const derivedSlug = slug ?? `problem-${leetcodeId}`
      resolve({
        leetcodeId: leetcodeId || 0,
        title: slugToTitle(derivedSlug),
        difficulty: "MEDIUM",
        url: `https://leetcode.com/problems/${derivedSlug}/`,
      })
    }, 700)
  })
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

  function reset() {
    setInput("")
    setStatus("idle")
    setPreview(null)
    setError(null)
  }

  async function handleFetch() {
    if (!input.trim()) return
    setStatus("loading")
    setPreview(null)
    setError(null)
    try {
      const result = await simulateFetch(input)
      setPreview(result)
      setStatus("fetched")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch problem")
      setStatus("error")
    }
  }

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
            <div className="flex gap-2">
              <Input
                id="problem-input"
                placeholder="e.g. 1 or leetcode.com/problems/two-sum/"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  setStatus("idle")
                  setPreview(null)
                  setError(null)
                }}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                disabled={status === "loading"}
              />
              <Button
                variant="secondary"
                onClick={handleFetch}
                disabled={!input.trim() || status === "loading"}
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Fetch"
                )}
              </Button>
            </div>
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
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
            <Button
              variant="outline"
              onClick={() => { setOpen(false); reset() }}
            >
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
