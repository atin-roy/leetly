"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpDown, ArrowUpRight, Search } from "lucide-react"
import { EmptyStateBlock, HeroPanel, MetricStrip, SectionHeader } from "@/components/demo/surfaces"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getDemoProblems } from "@/lib/demo-data"

type DifficultyFilter = "all" | "Easy" | "Medium" | "Hard"
type StatusFilter = "all" | "Unseen" | "Attempted" | "Solved" | "Mastered"
type SortKey = "difficulty" | "status" | "nextReview"
type SortDirection = "asc" | "desc"

const PAGE_SIZE = 10
const TABLE_ROW_CLASS_NAME = "h-24"
const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2 }
const statusOrder = { Unseen: 0, Attempted: 1, Solved: 2, Mastered: 3 }

function getNextReviewValue(value: string) {
  if (value === "Queue when ready") return Number.MAX_SAFE_INTEGER
  if (value.startsWith("Today,")) {
    const [, time] = value.split(", ")
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }
  if (value.startsWith("Tomorrow,")) {
    const [, time] = value.split(", ")
    const [hours, minutes] = time.split(":").map(Number)
    return 24 * 60 + hours * 60 + minutes
  }
  if (value.startsWith("In ")) {
    const amount = Number.parseInt(value.split(" ")[1] ?? "0", 10)
    if (value.includes("day")) return amount * 24 * 60
    if (value.includes("week")) return amount * 7 * 24 * 60
  }
  return Number.MAX_SAFE_INTEGER - 1
}

function SortHeaderButton({
  activeDirection,
  column,
  label,
  onSort,
}: {
  activeDirection: SortDirection | null
  column: SortKey
  label: string
  onSort: (column: SortKey) => void
}) {
  const Icon = !activeDirection ? ArrowUpDown : activeDirection === "asc" ? ArrowUp : ArrowDown

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className="flex max-w-full items-center gap-1.5 text-left transition-colors hover:text-[var(--text-primary)]"
    >
      <span className="truncate">{label}</span>
      <Icon className="size-3.5 shrink-0" />
    </button>
  )
}

export default function ProblemsPage() {
  const problems = getDemoProblems()
  const [search, setSearch] = useState("")
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [sort, setSort] = useState<{ key: SortKey | null; direction: SortDirection }>({ key: null, direction: "asc" })
  const [pagination, setPagination] = useState({ page: 1, filterKey: "all||all" })

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesSearch =
        search.trim().length === 0 ||
        problem.title.toLowerCase().includes(search.toLowerCase()) ||
        problem.pattern.toLowerCase().includes(search.toLowerCase()) ||
        problem.topic.toLowerCase().includes(search.toLowerCase())
      const matchesDifficulty = difficulty === "all" || problem.difficulty === difficulty
      const matchesStatus = status === "all" || problem.status === status

      return matchesSearch && matchesDifficulty && matchesStatus
    })
  }, [difficulty, problems, search, status])

  const sortedProblems = useMemo(() => {
    const items = [...filteredProblems]

    if (!sort.key) return items

    items.sort((left, right) => {
      let comparison = 0

      if (sort.key === "difficulty") {
        comparison = difficultyOrder[left.difficulty] - difficultyOrder[right.difficulty]
      } else if (sort.key === "status") {
        comparison = statusOrder[left.status] - statusOrder[right.status]
      } else if (sort.key === "nextReview") {
        comparison = getNextReviewValue(left.nextReview) - getNextReviewValue(right.nextReview)
      }

      if (comparison === 0) {
        comparison = left.leetcodeId - right.leetcodeId
      }

      return sort.direction === "asc" ? comparison : -comparison
    })

    return items
  }, [filteredProblems, sort])

  const filterKey = `${search.trim().toLowerCase()}|${difficulty}|${status}|${sort.key ?? "none"}|${sort.direction}`
  const totalPages = Math.max(1, Math.ceil(sortedProblems.length / PAGE_SIZE))
  const currentPage = Math.min(pagination.filterKey === filterKey ? pagination.page : 1, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const paginatedProblems = sortedProblems.slice(startIndex, startIndex + PAGE_SIZE)
  const emptyRowCount = Math.max(0, PAGE_SIZE - paginatedProblems.length)
  const rangeStart = sortedProblems.length === 0 ? 0 : startIndex + 1
  const rangeEnd = Math.min(startIndex + PAGE_SIZE, sortedProblems.length)

  function handleSort(key: SortKey) {
    setSort((current) => {
      if (current.key === key) {
        if (current.direction === "asc") {
          return { key, direction: "desc" }
        }

        return { key: null, direction: "asc" }
      }

      return { key, direction: "asc" }
    })
  }

  return (
    <div className="space-y-6">
      <HeroPanel
        eyebrow="Problems workspace"
        title="A table, but designed like a working spread."
        description="The problems route keeps its utility but now reads like a curation workspace: strong filters, clearer status language, and direct entry into richer case-study detail pages."
        kicker={`${filteredProblems.length} visible problems · ${problems.filter((item) => item.inReview).length} in active review`}
      />

      <MetricStrip
        items={[
          { label: "Visible set", value: String(filteredProblems.length), change: "after local filters", tone: "neutral" },
          { label: "Hard problems", value: String(problems.filter((item) => item.difficulty === "Hard").length), change: "represented in mock data", tone: "warning" },
          { label: "Mastered", value: String(problems.filter((item) => item.status === "Mastered").length), change: "clean explanation archive", tone: "positive" },
          { label: "Review-linked", value: String(problems.filter((item) => item.inReview).length), change: "scheduled or due", tone: "positive" },
        ]}
      />

      <section className="panel p-6">
        <SectionHeader
          eyebrow="Filters"
          title="Reduce the table without flattening it."
          description="This branch keeps filtering local and visual. The point is to prove the workspace feel before reconnecting live queries."
        />
        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title, pattern, or topic" className="pl-11" />
          </div>
          <Select value={difficulty} onValueChange={(value) => setDifficulty(value as DifficultyFilter)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All difficulties</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Unseen">Unseen</SelectItem>
              <SelectItem value="Attempted">Attempted</SelectItem>
              <SelectItem value="Solved">Solved</SelectItem>
              <SelectItem value="Mastered">Mastered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {filteredProblems.length === 0 ? (
        <EmptyStateBlock
          title="No problems match the current slice."
          description="The empty state is part of the redesign too. Reset the local filters and the full mock archive returns immediately."
          action={
            <Button variant="outline" onClick={() => {
              setSearch("")
              setDifficulty("all")
              setStatus("all")
            }}>
              Reset Filters
            </Button>
          }
        />
      ) : (
        <section className="panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] px-6 py-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Visible archive</p>
              <h2 className="mt-2 font-serif text-2xl text-[var(--text-primary)]">Problems on this page</h2>
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              Showing {rangeStart}-{rangeEnd} of {sortedProblems.length}
            </div>
          </div>

          <Table className="table-fixed" containerClassName="overflow-x-hidden rounded-none border-x-0 border-y-0 bg-transparent">
            <colgroup>
              <col className="w-[34%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[5%]" />
              <col className="w-[7%]" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead>Problem</TableHead>
                <TableHead><SortHeaderButton column="difficulty" label="Difficulty" activeDirection={sort.key === "difficulty" ? sort.direction : null} onSort={handleSort} /></TableHead>
                <TableHead><SortHeaderButton column="status" label="Status" activeDirection={sort.key === "status" ? sort.direction : null} onSort={handleSort} /></TableHead>
                <TableHead>Pattern</TableHead>
                <TableHead><SortHeaderButton column="nextReview" label="Next Review" activeDirection={sort.key === "nextReview" ? sort.direction : null} onSort={handleSort} /></TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProblems.map((problem) => (
                <TableRow key={problem.id} className={TABLE_ROW_CLASS_NAME}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--text-primary)]">{problem.title}</p>
                      <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                        #{problem.leetcodeId} · {problem.topic} · Last attempt: {problem.lastTouched}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{problem.difficulty}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={problem.status === "Mastered" ? "default" : "outline"}>{problem.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="truncate">{problem.pattern}</div>
                  </TableCell>
                  <TableCell>
                    <div className="truncate">{problem.nextReview}</div>
                  </TableCell>
                  <TableCell>{problem.noteCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <Button variant="ghost" size="sm" className="shrink-0" asChild>
                        <Link href={`/problems/${problem.id}`}>
                        Open
                        <ArrowUpRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {Array.from({ length: emptyRowCount }, (_, index) => (
                <TableRow
                  key={`empty-row-${index}`}
                  aria-hidden="true"
                  className={`${TABLE_ROW_CLASS_NAME} pointer-events-none hover:bg-transparent`}
                >
                  <TableCell>&nbsp;</TableCell>
                  <TableCell>&nbsp;</TableCell>
                  <TableCell>&nbsp;</TableCell>
                  <TableCell>&nbsp;</TableCell>
                  <TableCell>&nbsp;</TableCell>
                  <TableCell>&nbsp;</TableCell>
                  <TableCell>&nbsp;</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] px-6 py-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-[var(--text-muted)]">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({ page: Math.max(1, currentPage - 1), filterKey })}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="size-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({ page: Math.min(totalPages, currentPage + 1), filterKey })}
                disabled={currentPage === totalPages}
              >
                Next
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
