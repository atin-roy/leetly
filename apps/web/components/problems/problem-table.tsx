"use client"

import { useState } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Check, Clock, ExternalLink, Plus, SquareArrowOutUpRight, StickyNote, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { useUpdateProblemStatus } from "@/hooks/use-problems"
import { ReviewIndicator } from "@/components/review/review-indicator"
import { QuickReviewButtons } from "@/components/review/quick-review-buttons"
import { AttemptForm } from "./attempt-form"
import { CopyProblemButton } from "./copy-problem-button"
import { DifficultyBadge } from "./difficulty-badge"
import { statusLabels, statusStyles } from "./status-badge"
import type { ProblemStatus, ProblemSummaryDto } from "@/lib/types"

const COLS = 11
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
  onEnrollReview?: (problem: ProblemSummaryDto) => void
  onRemoveReview?: (problemId: number, cardId: number) => void
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

function formatLastAttempt(value: string | null) {
  if (!value) return "Never"
  return format(new Date(value), "MMM d, yyyy")
}

function getProblemHref(problemId: number) {
  return `/problems/${problemId}`
}

function openProblemInNewTab(problemId: number) {
  window.open(getProblemHref(problemId), "_blank", "noopener,noreferrer")
}

function StatusCell({ problem }: { problem: ProblemSummaryDto }) {
  const statusMutation = useUpdateProblemStatus(problem.id)
  const [optimisticStatus, setOptimisticStatus] = useState<ProblemStatus | null>(null)
  const [open, setOpen] = useState(false)
  const status = optimisticStatus ?? problem.status

  async function handleChange(nextStatus: ProblemStatus) {
    if (nextStatus === status) {
      setOpen(false)
      return
    }

    setOptimisticStatus(nextStatus)
    setOpen(false)

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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          data-interactive="true"
          aria-label={`Change status for ${problem.title}`}
          disabled={statusMutation.isPending}
          onClick={(e) => e.stopPropagation()}
          className="cursor-pointer"
        >
          <Badge variant="outline" className={`${statusStyles[status]} transition-opacity hover:opacity-80`}>
            {statusLabels[status]}
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1" align="center">
          <div className="flex flex-col gap-0.5">
            {STATUSES.map((option) => (
              <button
                key={option}
                onClick={() => handleChange(option)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                <Check className={`h-3.5 w-3.5 ${option === status ? "opacity-100" : "opacity-0"}`} />
                <Badge variant="outline" className={statusStyles[option]}>
                  {statusLabels[option]}
                </Badge>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
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
  onEnrollReview,
  onRemoveReview,
}: Props) {
  const router = useRouter()
  const [attemptProblem, setAttemptProblem] = useState<ProblemSummaryDto | null>(null)

  function openProblem(problemId: number) {
    router.push(getProblemHref(problemId))
  }

  const header = (
    <TableHeader>
      <TableRow>
        <TableHead className="w-16">#</TableHead>
        <TableHead>Title</TableHead>
        <TableHead className="w-36 text-center">Last Attempt</TableHead>
        <TableHead className="w-24 text-center">LeetCode</TableHead>
        <TableHead className="w-20 text-center">Note</TableHead>
        <TableHead className="w-28 text-center">Difficulty</TableHead>
        <TableHead className="w-40 text-center">Status</TableHead>
        <TableHead className="w-24 text-center">Review</TableHead>
        <TableHead className="w-24 text-center">Export Details</TableHead>
        <TableHead className="w-24 text-center">Attempts</TableHead>
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
    <>
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
                  <ContextMenu key={p.id}>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        className={`${ROW_H} group cursor-pointer border-border/60 transition-colors hover:bg-accent/55`}
                        onClick={(e) => {
                          if (isInteractiveTarget(e.target)) return
                          openProblem(p.id)
                        }}
                        onMouseDown={(e) => {
                          if (e.button !== 1 || isInteractiveTarget(e.target)) return
                          e.preventDefault()
                        }}
                        onAuxClick={(e) => {
                          if (e.button !== 1 || isInteractiveTarget(e.target)) return
                          e.preventDefault()
                          openProblemInNewTab(p.id)
                        }}
                      >
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {p.leetcodeId}
                        </TableCell>
                        <TableCell className="font-medium">{p.title}</TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {formatLastAttempt(p.lastAttemptedAt)}
                        </TableCell>
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
                        {/* Review column */}
                        <TableCell className="text-center" data-interactive="true" onClick={(e) => e.stopPropagation()}>
                          {p.reviewCard ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  data-interactive="true"
                                  className="inline-flex"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ReviewIndicator reviewCard={p.reviewCard} />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-2" align="center">
                                <QuickReviewButtons cardId={p.reviewCard.id} size="sm" />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <button
                              onClick={() => onEnrollReview?.(p)}
                              data-interactive="true"
                              disabled={!onEnrollReview}
                              title="Mark for review"
                              className="inline-flex opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground disabled:pointer-events-none"
                            >
                              <Clock className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="text-center" data-interactive="true" onClick={(e) => e.stopPropagation()}>
                          <CopyProblemButton
                            problemId={p.id}
                            size="icon"
                            showText={false}
                            title="Copy full problem details"
                          />
                        </TableCell>
                        {/* Attempts column */}
                        <TableCell className="text-center" data-interactive="true" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            {p.totalAttempts > 0 && (
                              <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs font-medium tabular-nums">
                                {p.totalAttempts}
                              </Badge>
                            )}
                            <button
                              onClick={() => setAttemptProblem(p)}
                              data-interactive="true"
                              title="Log attempt"
                              className={`inline-flex text-muted-foreground hover:text-foreground transition-opacity ${p.totalAttempts > 0 ? "opacity-0 group-hover:opacity-100" : ""}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
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
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-56">
                      <ContextMenuItem onClick={() => openProblemInNewTab(p.id)}>
                        <SquareArrowOutUpRight />
                        Open problem detail
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => window.open(p.url, "_blank", "noopener,noreferrer")}>
                        <ExternalLink />
                        Open in LeetCode
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={() => setAttemptProblem(p)}>
                        <Plus />
                        Log attempt
                      </ContextMenuItem>
                      <ContextMenuItem disabled={!onNoteClick} onClick={() => onNoteClick?.(p)}>
                        <StickyNote />
                        {hasNote ? "Edit note" : "Add note"}
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      {p.reviewCard ? (
                        <ContextMenuItem
                          disabled={!onRemoveReview}
                          onClick={() => onRemoveReview?.(p.id, p.reviewCard!.id)}
                        >
                          <X />
                          Remove from Revision
                        </ContextMenuItem>
                      ) : (
                        <ContextMenuItem
                          disabled={!onEnrollReview}
                          onClick={() => onEnrollReview?.(p)}
                        >
                          <Clock />
                          Mark for Revision
                        </ContextMenuItem>
                      )}
                      <ContextMenuItem
                        variant="destructive"
                        disabled={!onDelete}
                        onClick={() => onDelete?.(p)}
                      >
                        <Trash2 />
                        Remove problem
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                )
              })}
              {Array.from({ length: fillerCount }).map((_, i) => (
                <FillerRow key={i} />
              ))}
            </>
          )}
        </TableBody>
      </Table>
      <AttemptForm
        open={attemptProblem !== null}
        onOpenChange={(open) => {
          if (!open) setAttemptProblem(null)
        }}
        problemId={attemptProblem?.id ?? 0}
      />
    </>
  )
}
