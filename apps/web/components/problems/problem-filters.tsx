"use client"

import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  { value: "id_asc", label: "ID ↑" },
  { value: "id_desc", label: "ID ↓" },
  { value: "name_asc", label: "Name A → Z" },
  { value: "name_desc", label: "Name Z → A" },
  { value: "difficulty_asc", label: "Difficulty: Easy first" },
  { value: "difficulty_desc", label: "Difficulty: Hard first" },
  { value: "status_asc", label: "Status: Unseen first" },
  { value: "status_desc", label: "Status: Mastered first" },
]

export function ProblemFilters({ filters, onChange, onReset }: Props) {
  const { data: topics } = useTopics()
  const { data: patterns } = usePatterns()

  const hasFilters =
    filters.difficulty ||
    filters.status ||
    filters.topicId ||
    filters.patternId ||
    filters.search ||
    filters.sort

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search problems..."
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value || undefined, page: 0 })}
          className="pl-8"
        />
      </div>

      <Select
        value={filters.difficulty ?? "all"}
        onValueChange={(v) =>
          onChange({ difficulty: v === "all" ? undefined : (v as Difficulty), page: 0 })
        }
      >
        <SelectTrigger className="w-36">
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

      <Select
        value={filters.status ?? "all"}
        onValueChange={(v) =>
          onChange({ status: v === "all" ? undefined : (v as ProblemStatus), page: 0 })
        }
      >
        <SelectTrigger className="w-40">
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

      <Select
        value={filters.topicId ? String(filters.topicId) : "all"}
        onValueChange={(v) =>
          onChange({ topicId: v === "all" ? undefined : Number(v), page: 0 })
        }
      >
        <SelectTrigger className="w-36">
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

      <Select
        value={filters.patternId ? String(filters.patternId) : "all"}
        onValueChange={(v) =>
          onChange({ patternId: v === "all" ? undefined : Number(v), page: 0 })
        }
      >
        <SelectTrigger className="w-36">
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

      <Select
        value={filters.sort ?? "none"}
        onValueChange={(v) =>
          onChange({ sort: v === "none" ? undefined : v, page: 0 })
        }
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Sort by Default</SelectItem>
          {SORT_OPTIONS.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  )
}
