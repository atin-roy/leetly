"use client"

import Link from "next/link"
import { ExternalLink, StickyNote } from "lucide-react"
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

interface Props {
  problems?: ProblemSummaryDto[]
  isLoading?: boolean
  onNoteClick?: (problem: ProblemSummaryDto) => void
  notedProblemIds?: Set<number>
}

export function ProblemTable({ problems, isLoading, onNoteClick, notedProblemIds }: Props) {
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-24 text-center">LeetCode</TableHead>
            <TableHead className="w-20 text-center">Note</TableHead>
            <TableHead className="w-28 text-center">Difficulty</TableHead>
            <TableHead className="w-40 text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 6 }).map((_, j) => (
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

  if (!problems?.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        No problems found.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">#</TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="w-24 text-center">LeetCode</TableHead>
          <TableHead className="w-20 text-center">Note</TableHead>
          <TableHead className="w-28 text-center">Difficulty</TableHead>
          <TableHead className="w-40 text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {problems.map((p) => {
          const hasNote = notedProblemIds?.has(p.id) ?? false
          return (
          <TableRow key={p.id}>
            <TableCell className="font-mono text-sm text-muted-foreground">
              {p.leetcodeId}
            </TableCell>
            <TableCell>
              <Link
                href={`/problems/${p.id}`}
                className="font-medium hover:underline"
              >
                {p.title}
              </Link>
            </TableCell>
            <TableCell className="text-center">
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </TableCell>
            <TableCell className="text-center">
              <button
                onClick={() => onNoteClick?.(p)}
                className={hasNote ? "inline-flex text-primary hover:text-primary/70" : "inline-flex text-muted-foreground hover:text-foreground disabled:opacity-30"}
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
          </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
