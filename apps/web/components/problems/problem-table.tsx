"use client"

import { useRouter } from "next/navigation"
import { ExternalLink, StickyNote, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DifficultyBadge } from "./difficulty-badge"
import { StatusBadge } from "./status-badge"
import type { ProblemSummaryDto } from "@/lib/types"

const COLS = 7
const ROW_H = "h-11"

interface Props {
  problems?: ProblemSummaryDto[]
  isLoading?: boolean
  pageSize?: number
  onNoteClick?: (problem: ProblemSummaryDto) => void
  onDelete?: (problem: ProblemSummaryDto) => void
  notedProblemIds?: Set<number>
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
                  onClick={() => router.push(`/problems/${p.id}`)}
                >
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {p.leetcodeId}
                  </TableCell>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </TableCell>
                  <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onNoteClick?.(p)}
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
                  <TableCell className="text-center">
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onDelete?.(p)}
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
