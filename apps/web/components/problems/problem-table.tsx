"use client"

import Link from "next/link"
import { ChevronRight, ExternalLink } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DifficultyBadge } from "./difficulty-badge"
import { StatusBadge } from "./status-badge"
import type { ProblemSummaryDto } from "@/lib/types"

interface Props {
  problems?: ProblemSummaryDto[]
  isLoading?: boolean
  onNoteClick?: (problem: ProblemSummaryDto) => void
}

export function ProblemTable({ problems, isLoading, onNoteClick }: Props) {
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-28">Difficulty</TableHead>
            <TableHead className="w-40">Status</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 5 }).map((_, j) => (
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
          <TableHead className="w-28">Difficulty</TableHead>
          <TableHead className="w-40">Status</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {problems.map((p) => (
          <TableRow
            key={p.id}
            className={onNoteClick ? "cursor-pointer" : undefined}
            onClick={() => onNoteClick?.(p)}
          >
            <TableCell className="font-mono text-sm text-muted-foreground">
              {p.leetcodeId}
            </TableCell>
            <TableCell>
              <span className="font-medium">{p.title}</span>
            </TableCell>
            <TableCell>
              <DifficultyBadge difficulty={p.difficulty} />
            </TableCell>
            <TableCell>
              <StatusBadge status={p.status} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Link
                  href={`/problems/${p.id}`}
                  className="text-muted-foreground hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
