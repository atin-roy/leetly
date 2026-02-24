"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProblemFilters } from "@/components/problems/problem-filters"
import { ProblemTable } from "@/components/problems/problem-table"
import { AddProblemDialog } from "@/components/problems/add-problem-dialog"
import type { ProblemFilters as Filters, ProblemSummaryDto } from "@/lib/types"

// TODO: replace with real data from useProblems()
const DUMMY_PROBLEMS: ProblemSummaryDto[] = [
  { id: 1, leetcodeId: 1, title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", difficulty: "EASY", status: "MASTERED" },
  { id: 2, leetcodeId: 21, title: "Merge Two Sorted Lists", url: "https://leetcode.com/problems/merge-two-sorted-lists/", difficulty: "EASY", status: "MASTERED" },
  { id: 3, leetcodeId: 70, title: "Climbing Stairs", url: "https://leetcode.com/problems/climbing-stairs/", difficulty: "EASY", status: "MASTERED" },
  { id: 4, leetcodeId: 121, title: "Best Time to Buy and Sell Stock", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", difficulty: "EASY", status: "SOLVED" },
  { id: 5, leetcodeId: 141, title: "Linked List Cycle", url: "https://leetcode.com/problems/linked-list-cycle/", difficulty: "EASY", status: "MASTERED" },
  { id: 6, leetcodeId: 206, title: "Reverse Linked List", url: "https://leetcode.com/problems/reverse-linked-list/", difficulty: "EASY", status: "MASTERED" },
  { id: 7, leetcodeId: 217, title: "Contains Duplicate", url: "https://leetcode.com/problems/contains-duplicate/", difficulty: "EASY", status: "MASTERED" },
  { id: 8, leetcodeId: 226, title: "Invert Binary Tree", url: "https://leetcode.com/problems/invert-binary-tree/", difficulty: "EASY", status: "SOLVED" },
  { id: 9, leetcodeId: 15, title: "3Sum", url: "https://leetcode.com/problems/3sum/", difficulty: "MEDIUM", status: "SOLVED" },
  { id: 10, leetcodeId: 53, title: "Maximum Subarray", url: "https://leetcode.com/problems/maximum-subarray/", difficulty: "MEDIUM", status: "SOLVED_WITH_HELP" },
  { id: 11, leetcodeId: 98, title: "Validate Binary Search Tree", url: "https://leetcode.com/problems/validate-binary-search-tree/", difficulty: "MEDIUM", status: "SOLVED" },
  { id: 12, leetcodeId: 139, title: "Word Break", url: "https://leetcode.com/problems/word-break/", difficulty: "MEDIUM", status: "SOLVED_WITH_HELP" },
  { id: 13, leetcodeId: 146, title: "LRU Cache", url: "https://leetcode.com/problems/lru-cache/", difficulty: "MEDIUM", status: "ATTEMPTED" },
  { id: 14, leetcodeId: 200, title: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands/", difficulty: "MEDIUM", status: "ATTEMPTED" },
  { id: 15, leetcodeId: 238, title: "Product of Array Except Self", url: "https://leetcode.com/problems/product-of-array-except-self/", difficulty: "MEDIUM", status: "SOLVED" },
  { id: 16, leetcodeId: 300, title: "Longest Increasing Subsequence", url: "https://leetcode.com/problems/longest-increasing-subsequence/", difficulty: "MEDIUM", status: "SOLVED_WITH_HELP" },
  { id: 17, leetcodeId: 322, title: "Coin Change", url: "https://leetcode.com/problems/coin-change/", difficulty: "MEDIUM", status: "SOLVED_WITH_HELP" },
  { id: 18, leetcodeId: 394, title: "Decode String", url: "https://leetcode.com/problems/decode-string/", difficulty: "MEDIUM", status: "ATTEMPTED" },
  { id: 19, leetcodeId: 424, title: "Longest Repeating Character Replacement", url: "https://leetcode.com/problems/longest-repeating-character-replacement/", difficulty: "MEDIUM", status: "UNSEEN" },
  { id: 20, leetcodeId: 739, title: "Daily Temperatures", url: "https://leetcode.com/problems/daily-temperatures/", difficulty: "MEDIUM", status: "SOLVED" },
  { id: 21, leetcodeId: 42, title: "Trapping Rain Water", url: "https://leetcode.com/problems/trapping-rain-water/", difficulty: "HARD", status: "SOLVED_WITH_HELP" },
  { id: 22, leetcodeId: 76, title: "Minimum Window Substring", url: "https://leetcode.com/problems/minimum-window-substring/", difficulty: "HARD", status: "ATTEMPTED" },
  { id: 23, leetcodeId: 84, title: "Largest Rectangle in Histogram", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/", difficulty: "HARD", status: "UNSEEN" },
  { id: 24, leetcodeId: 124, title: "Binary Tree Maximum Path Sum", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/", difficulty: "HARD", status: "UNSEEN" },
  { id: 25, leetcodeId: 295, title: "Find Median from Data Stream", url: "https://leetcode.com/problems/find-median-from-data-stream/", difficulty: "HARD", status: "ATTEMPTED" },
]

const PAGE_SIZE = 25
const DEFAULT_FILTERS: Filters = { page: 0, size: PAGE_SIZE }

export default function ProblemsPage() {
  const [problems, setProblems] = useState<ProblemSummaryDto[]>(DUMMY_PROBLEMS)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  function handleChange(partial: Partial<Filters>) {
    setFilters((f) => ({ ...f, ...partial }))
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS)
  }

  const DIFFICULTY_ORDER: Record<string, number> = { EASY: 0, MEDIUM: 1, HARD: 2 }
  const STATUS_ORDER: Record<string, number> = {
    UNSEEN: 0, ATTEMPTED: 1, SOLVED_WITH_HELP: 2, SOLVED: 3, MASTERED: 4,
  }

  // TODO: replace with server-side pagination/filtering from useProblems()
  const filtered = problems.filter((p) => {
    if (filters.difficulty && p.difficulty !== filters.difficulty) return false
    if (filters.status && p.status !== filters.status) return false
    if (filters.search && !p.title.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const sorted = filters.sort
    ? [...filtered].sort((a, b) => {
        switch (filters.sort) {
          case "id_asc":  return a.leetcodeId - b.leetcodeId
          case "id_desc": return b.leetcodeId - a.leetcodeId
          case "name_asc":  return a.title.localeCompare(b.title)
          case "name_desc": return b.title.localeCompare(a.title)
          case "difficulty_asc":  return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]
          case "difficulty_desc": return DIFFICULTY_ORDER[b.difficulty] - DIFFICULTY_ORDER[a.difficulty]
          case "status_asc":  return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
          case "status_desc": return STATUS_ORDER[b.status] - STATUS_ORDER[a.status]
          default: return 0
        }
      })
    : filtered

  const page = filters.page ?? 0
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleAdd(p: Omit<ProblemSummaryDto, "id" | "status">) {
    setProblems((prev) => [...prev, { ...p, id: Date.now(), status: "UNSEEN" }])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Problems</h1>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{sorted.length} problems</p>
          <AddProblemDialog onAdd={handleAdd} />
        </div>
      </div>

      <ProblemFilters
        filters={filters}
        onChange={handleChange}
        onReset={handleReset}
      />

      <Card>
        <CardContent className="p-0">
          <ProblemTable problems={paged} />
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => handleChange({ page: page - 1 })}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => handleChange({ page: page + 1 })}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
