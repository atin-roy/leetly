"use client"

import { useEffect, useState } from "react"
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
import styles from "./problem-filters.module.css"

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

  return (
    <div className={styles.bar}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="problem-search">
          Search
        </label>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} aria-hidden="true" />
          <Input
            id="problem-search"
            placeholder="Name or ID"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={styles.search}
          />
        </div>
      </div>

      <SelectField
        label="Difficulty"
        value={filters.difficulty ?? "all"}
        onChange={(v) =>
          onChange({ difficulty: v === "all" ? undefined : (v as Difficulty), page: 0 })
        }
        allLabel="All"
        options={DIFFICULTIES}
      />

      <SelectField
        label="Status"
        value={filters.status ?? "all"}
        onChange={(v) =>
          onChange({ status: v === "all" ? undefined : (v as ProblemStatus), page: 0 })
        }
        allLabel="All"
        options={STATUSES}
      />

      <SelectField
        label="Topic"
        value={filters.topicId ? String(filters.topicId) : "all"}
        onChange={(v) => onChange({ topicId: v === "all" ? undefined : Number(v), page: 0 })}
        allLabel="All"
        options={(topics ?? []).map((t) => ({ value: String(t.id), label: t.name }))}
      />

      <SelectField
        label="Pattern"
        value={filters.patternId ? String(filters.patternId) : "all"}
        onChange={(v) => onChange({ patternId: v === "all" ? undefined : Number(v), page: 0 })}
        allLabel="All"
        options={(patterns ?? []).map((p) => ({ value: String(p.id), label: p.name }))}
      />

      <SelectField
        label="Sort"
        value={filters.sort ?? DEFAULT_SORT}
        onChange={(v) => onChange({ sort: v, page: 0 })}
        options={SORT_OPTIONS}
      />

      {hasFilters ? (
        <Button
          variant="ghost"
          size="sm"
          className={styles.clear}
          onClick={() => {
            setSearchValue("")
            onReset()
          }}
        >
          <X />
          Clear
        </Button>
      ) : null}
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  /** Omitted for sort, which always has a value and so has no "all" row. */
  allLabel?: string
}) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={styles.select} aria-label={label}>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {allLabel && <SelectItem value="all">{allLabel}</SelectItem>}
          {options.map(({ value: optionValue, label: optionLabel }) => (
            <SelectItem key={optionValue} value={optionValue}>
              {optionLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
