"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink, StickyNote, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useUpdateProblemStatus } from "@/hooks/use-problems"
import { DifficultyBadge } from "./difficulty-badge"
import { StatusBadge } from "./status-badge"
import type { ProblemStatus, ProblemSummaryDto } from "@/lib/types"

const COLS = 7
const ROW_H = "h-11"
const STATUSES: ProblemStatus[] = [
  "UNSEEN",
  "ATTEMPTED",
  "SOLVED_WITH_HELP",
  "SOLVED",
  "MASTERED",
]

interface Props {
  problems?: ProblemSummaryDto[]
  isLoading?: boolean
  pageSize?: number
  onNoteClick?: (problem: ProblemSummaryDto) => void
  onDelete?: (problem: ProblemSummaryDto) => void
  notedProblemIds?: Set<number>
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest("[data-interactive='true']"))
}

function FillerRow() {
  return (
    <TableRow className={`${ROW_H} pointer-events-none select-none`}>
      {Array.from({ length: COLS }).map((_, j) => (
        <TableCell key={j} />
      ))}
    </TableRow>
  )
}

function StatusCell({ problem }: { problem: ProblemSummaryDto }) {
  const statusMutation = useUpdateProblemStatus(problem.id)
  const [optimisticStatus, setOptimisticStatus] = useState<ProblemStatus | null>(null)
  const status = optimisticStatus ?? problem.status

  async function handleChange(nextStatus: string) {
    if (nextStatus === status) return

    setOptimisticStatus(nextStatus as ProblemStatus)

    try {
      await statusMutation.mutateAsync(nextStatus)
    } catch {
      setOptimisticStatus(null)
      toast.error("Failed to update status")
      return
    }

    setOptimisticStatus(null)
  }

  return (
    <div data-interactive="true" className="flex justify-center" onClick={(e) => e.stopPropagation()}>
      <Select value={status} onValueChange={handleChange} disabled={statusMutation.isPending}>
        <SelectTrigger
          data-interactive="true"
          aria-label={`Change status for ${problem.title}`}
          className="h-8 min-w-[9.5rem] justify-between rounded-full border border-border/80 bg-background px-2.5 shadow-none focus:ring-0"
          onClick={(e) => e.stopPropagation()}
        >
          <SelectValue>
            <StatusBadge status={status} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((option) => (
            <SelectItem key={option} value={option}>
              <StatusBadge status={option} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function ProblemTable({
  problems,
  isLoading,
  pageSize = 20,
  onNoteClick,
  onDelete,
  notedProblemIds,
}: Props) {
  const router = useRouter()

  const header = (
    <TableHeader>
      <TableRow>
        <TableHead className="w-16">#</TableHead>
        <TableHead>Title</TableHead>
        <TableHead className="w-24 text-center">LeetCode</TableHead>
        <TableHead className="w-20 text-center">Note</TableHead>
        <TableHead className="w-28 text-center">Difficulty</TableHead>
        <TableHead className="w-40 text-center">Status</TableHead>
        <TableHead className="w-10" />
      </TableRow>
    </TableHeader>
  )

  if (isLoading) {
    return (
      <Table>
        {header}
        <TableBody>
          {Array.from({ length: pageSize }).map((_, i) => (
            <TableRow key={i} className={ROW_H}>
              {Array.from({ length: COLS }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  const rows = problems ?? []
  const fillerCount = Math.max(0, pageSize - rows.length)

  return (
    <Table>
      {header}
      <TableBody>
        {rows.length === 0 ? (
          <>
            <TableRow className={`${ROW_H} pointer-events-none select-none`}>
              <TableCell colSpan={COLS} className="text-center text-sm text-muted-foreground">
                No problems found.
              </TableCell>
            </TableRow>
            {Array.from({ length: pageSize - 1 }).map((_, i) => (
              <FillerRow key={i} />
            ))}
          </>
        ) : (
          <>
            {rows.map((p) => {
              const hasNote = notedProblemIds?.has(p.id) ?? false
              return (
                <TableRow
                  key={p.id}
                  className={`${ROW_H} group cursor-pointer`}
                  onClick={(e) => {
                    if (isInteractiveTarget(e.target)) return
                    router.push(`/problems/${p.id}`)
                  }}
                >
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {p.leetcodeId}
                  </TableCell>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="text-center" data-interactive="true" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-interactive="true"
                      className="inline-flex text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </TableCell>
                  <TableCell className="text-center" data-interactive="true" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onNoteClick?.(p)}
                      data-interactive="true"
                      className={
                        hasNote
                          ? "inline-flex text-primary hover:text-primary/70"
                          : "inline-flex text-muted-foreground hover:text-foreground disabled:opacity-30"
                      }
                      disabled={!onNoteClick}
                      title={hasNote ? "Edit note" : "Add note"}
                    >
                      <StickyNote className={`h-4 w-4 ${hasNote ? "fill-primary/20" : ""}`} />
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    <DifficultyBadge difficulty={p.difficulty} />
                  </TableCell>
                  <TableCell className="text-center" data-interactive="true" onClick={(e) => e.stopPropagation()}>
                    <StatusCell problem={p} />
                  </TableCell>
                  <TableCell className="text-center" data-interactive="true" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onDelete?.(p)}
                      data-interactive="true"
                      disabled={!onDelete}
                      title="Remove problem"
                      className="inline-flex opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive disabled:pointer-events-none"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              )
            })}
            {Array.from({ length: fillerCount }).map((_, i) => (
              <FillerRow key={i} />
            ))}
          </>
        )}
      </TableBody>
    </Table>
  )
}
