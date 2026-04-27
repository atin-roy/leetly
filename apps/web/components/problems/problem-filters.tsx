"use client"

import { useEffect, useState } from "react"
import { Filter, Search, SlidersHorizontal, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePatterns, useTopics } from "@/hooks/use-problems"
import type { Difficulty, ProblemFilters, ProblemStatus } from "@/lib/types"

interface Props {
  filters: ProblemFilters
  onChange: (f: Partial<ProblemFilters>) => void
  onReset: () => void
}

const DEFAULT_SORT = "createdDate,desc"

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
]

const STATUSES: { value: ProblemStatus; label: string }[] = [
  { value: "UNSEEN", label: "Unseen" },
  { value: "ATTEMPTED", label: "Attempted" },
  { value: "SOLVED_WITH_HELP", label: "Solved w/ Help" },
  { value: "SOLVED", label: "Solved" },
  { value: "MASTERED", label: "Mastered" },
]

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "createdDate,desc", label: "Recently Added" },
  { value: "createdDate,asc", label: "Oldest First" },
  { value: "lastAttemptedAt,desc", label: "Recent Attempt" },
  { value: "lastAttemptedAt,asc", label: "Oldest Attempt" },
  { value: "leetcodeId,asc", label: "ID ↑" },
  { value: "leetcodeId,desc", label: "ID ↓" },
  { value: "title,asc", label: "Name A → Z" },
  { value: "title,desc", label: "Name Z → A" },
  { value: "difficulty,asc", label: "Difficulty: Easy first" },
  { value: "difficulty,desc", label: "Difficulty: Hard first" },
  { value: "status,asc", label: "Status: Unseen first" },
  { value: "status,desc", label: "Status: Mastered first" },
]

export function ProblemFilters({ filters, onChange, onReset }: Props) {
  const { data: topics } = useTopics()
  const { data: patterns } = usePatterns()
  const [searchValue, setSearchValue] = useState(filters.search ?? "")

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const normalized = searchValue.trim()
      const nextSearch = normalized || undefined
      if (nextSearch !== filters.search) {
        onChange({ search: nextSearch, page: 0 })
      }
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [filters.search, onChange, searchValue])

  const hasFilters =
    filters.difficulty ||
    filters.status ||
    filters.topicId ||
    filters.patternId ||
    filters.search ||
    (filters.sort && filters.sort !== DEFAULT_SORT)

  const activeFilterCount = [
    filters.difficulty,
    filters.status,
    filters.topicId,
    filters.patternId,
    filters.search,
    filters.sort && filters.sort !== DEFAULT_SORT ? filters.sort : undefined,
  ].filter(Boolean).length

  const selectedSortLabel = SORT_OPTIONS.find(({ value }) => value === (filters.sort ?? DEFAULT_SORT))?.label ?? "Recently Added"

  return (
    <Card className="overflow-hidden border-border/70 bg-card/80 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
      <CardContent className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              Query Studio
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Search, slice, and sort your practice backlog.</p>
              <p className="text-sm text-muted-foreground">Use a saved-looking filter surface instead of a flat utility row.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              {activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}
            </Badge>
            <Badge variant="outline" className="rounded-full border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              Sort: {selectedSortLabel}
            </Badge>
            {hasFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchValue("")
                  onReset()
                }}
                className="rounded-full"
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Clear filters
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Search</p>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="h-11 rounded-xl border-border/70 bg-background/85 pl-9 shadow-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Sort
            </p>
            <Select
              value={filters.sort ?? DEFAULT_SORT}
              onValueChange={(v) =>
                onChange({ sort: v, page: 0 })
              }
            >
              <SelectTrigger className="h-11 rounded-xl border-border/70 bg-background/85 shadow-none">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Difficulty</p>
            <Select
              value={filters.difficulty ?? "all"}
              onValueChange={(v) =>
                onChange({ difficulty: v === "all" ? undefined : (v as Difficulty), page: 0 })
              }
            >
              <SelectTrigger className="h-11 rounded-xl border-border/70 bg-background/85 shadow-none">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                {DIFFICULTIES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Status</p>
            <Select
              value={filters.status ?? "all"}
              onValueChange={(v) =>
                onChange({ status: v === "all" ? undefined : (v as ProblemStatus), page: 0 })
              }
            >
              <SelectTrigger className="h-11 rounded-xl border-border/70 bg-background/85 shadow-none">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Topic</p>
            <Select
              value={filters.topicId ? String(filters.topicId) : "all"}
              onValueChange={(v) =>
                onChange({ topicId: v === "all" ? undefined : Number(v), page: 0 })
              }
            >
              <SelectTrigger className="h-11 rounded-xl border-border/70 bg-background/85 shadow-none">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics?.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Pattern</p>
            <Select
              value={filters.patternId ? String(filters.patternId) : "all"}
              onValueChange={(v) =>
                onChange({ patternId: v === "all" ? undefined : Number(v), page: 0 })
              }
            >
              <SelectTrigger className="h-11 rounded-xl border-border/70 bg-background/85 shadow-none">
                <SelectValue placeholder="Pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patterns</SelectItem>
                {patterns?.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
