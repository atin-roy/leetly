"use client"

import { useState } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Check, Clock, ExternalLink, Plus, SquareArrowOutUpRight, StickyNote, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"
import { AttemptForm } from "./attempt-form"
import { CopyProblemButton } from "./copy-problem-button"
import { DifficultyBadge } from "./difficulty-badge"
import { statusLabels, statusStyles } from "./status-badge"
import type { ProblemStatus, ProblemSummaryDto } from "@/lib/types"

const COLS = 6
const ROW_H = "h-[108px]"
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

interface ProblemActionProps {
  problem: ProblemSummaryDto
  hasNote: boolean
  onNoteClick?: (problem: ProblemSummaryDto) => void
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

function formatLastAttemptDetail(value: string | null) {
  if (!value) return "No logged attempts yet"
  return `Last active ${format(new Date(value), "MMM d, yyyy")}`
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

function ActionIconButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground", className)}
      {...props}
    >
      {children}
    </Button>
  )
}

function ProblemUtilityActions({ problem, hasNote, onNoteClick }: ProblemActionProps) {
  return (
    <div className="flex items-center gap-1.5" data-interactive="true" onClick={(e) => e.stopPropagation()}>
      <ActionIconButton asChild title="Open in LeetCode">
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          data-interactive="true"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </ActionIconButton>
      <ActionIconButton
        onClick={() => onNoteClick?.(problem)}
        data-interactive="true"
        disabled={!onNoteClick}
        title={hasNote ? "Open note" : "Create note"}
        className={hasNote ? "text-primary hover:text-primary" : undefined}
      >
        <StickyNote className={cn("h-4 w-4", hasNote ? "fill-primary/15" : "")} />
      </ActionIconButton>
      <CopyProblemButton
        problemId={problem.id}
        size="icon"
        showText={false}
        title="Copy full problem details"
        className="h-8 w-8 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
      />
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
      <TableRow className="border-b border-border/70 bg-background/65">
        <TableHead className="w-[44%] py-4">Problem</TableHead>
        <TableHead className="w-[18%] py-4">Last Activity</TableHead>
        <TableHead className="w-[16%] py-4 text-center">Progress</TableHead>
        <TableHead className="w-[12%] py-4 text-center">Review</TableHead>
        <TableHead className="w-[10%] py-4 text-center">Attempts</TableHead>
        <TableHead className="w-10" />
      </TableRow>
    </TableHeader>
  )

  if (isLoading) {
    return (
      <>
        <div className="grid gap-3 p-3 sm:hidden">
          {Array.from({ length: Math.min(pageSize, 6) }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-border/70 bg-card/70 p-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-14 rounded-2xl" />
                  <Skeleton className="h-14 rounded-2xl" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-9 rounded-full" />
                  <Skeleton className="h-9 rounded-full" />
                  <Skeleton className="h-9 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Table className="hidden sm:table">
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
      </>
    )
  }

  const rows = problems ?? []
  const fillerCount = Math.max(0, pageSize - rows.length)

  return (
    <>
      <div className="space-y-3 p-3 sm:hidden">
        {rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/70 bg-card/50 px-5 py-12 text-center text-sm text-muted-foreground">
            No problems found.
          </div>
        ) : (
          rows.map((p) => {
            const hasNote = notedProblemIds?.has(p.id) ?? false

            return (
              <article
                key={p.id}
                className="rounded-3xl border border-border/70 bg-card/75 p-4 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.35)]"
              >
                <div
                  className="space-y-4"
                  onClick={() => openProblem(p.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        <span className="rounded-full border border-border/70 bg-background/70 px-2 py-1 font-mono tracking-[0.18em]">
                          #{p.leetcodeId}
                        </span>
                        <span>{formatLastAttemptDetail(p.lastAttemptedAt)}</span>
                      </div>
                      <h3 className="text-base font-semibold leading-6 text-foreground">{p.title}</h3>
                    </div>

                    <ProblemUtilityActions
                      problem={p}
                      hasNote={hasNote}
                      onNoteClick={onNoteClick}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <DifficultyBadge difficulty={p.difficulty} />
                    <StatusCell problem={p} />
                    {p.reviewCard ? (
                      <Badge
                        variant="outline"
                        className="rounded-full border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300"
                      >
                        In review
                      </Badge>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2" data-interactive="true" onClick={(e) => e.stopPropagation()}>
                    <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Last Attempt</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{formatLastAttempt(p.lastAttemptedAt)}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Attempts</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {p.totalAttempts > 0 ? `${p.totalAttempts} logged` : "None yet"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2" data-interactive="true" onClick={(e) => e.stopPropagation()}>
                    {p.reviewCard ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-11 rounded-full border-border/70 bg-background/70 justify-center"
                            data-interactive="true"
                          >
                            <ReviewIndicator reviewCard={p.reviewCard} />
                            <span className="ml-2">Review</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[calc(100vw-3rem)] max-w-72 p-3" align="center">
                          <QuickReviewButtons cardId={p.reviewCard.id} size="sm" />
                          {onRemoveReview ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 w-full rounded-full text-muted-foreground hover:text-foreground"
                              onClick={() => onRemoveReview(p.id, p.reviewCard!.id)}
                            >
                              Remove from review
                            </Button>
                          ) : null}
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Button
                        variant="outline"
                        className="h-11 rounded-full border-border/70 bg-background/70"
                        onClick={() => onEnrollReview?.(p)}
                        data-interactive="true"
                        disabled={!onEnrollReview}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Queue Review
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="h-11 rounded-full border-border/70 bg-background/70"
                      onClick={() => setAttemptProblem(p)}
                      data-interactive="true"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {p.totalAttempts > 0 ? "Log Again" : "Log Attempt"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2" data-interactive="true" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      className="h-11 rounded-full text-muted-foreground hover:text-foreground"
                      onClick={() => openProblem(p.id)}
                    >
                      Open Detail
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-11 rounded-full text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete?.(p)}
                      disabled={!onDelete}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </div>

      <Table className="hidden sm:table">
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
                        className={`${ROW_H} group cursor-pointer border-b border-border/60 transition-colors hover:bg-accent/25`}
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
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                  <span className="rounded-full border border-border/70 bg-background/70 px-2 py-1 font-mono tracking-[0.18em]">
                                    #{p.leetcodeId}
                                  </span>
                                  <span>{formatLastAttemptDetail(p.lastAttemptedAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-base font-semibold text-foreground">{p.title}</p>
                                </div>
                              </div>

                              <ProblemUtilityActions
                                problem={p}
                                hasNote={hasNote}
                                onNoteClick={onNoteClick}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">{formatLastAttempt(p.lastAttemptedAt)}</p>
                            <p className="text-sm text-muted-foreground">
                              {p.totalAttempts > 0 ? `${p.totalAttempts} logged attempt${p.totalAttempts === 1 ? "" : "s"}` : "Fresh in backlog"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-center" data-interactive="true" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col items-center gap-2">
                            <DifficultyBadge difficulty={p.difficulty} />
                            <StatusCell problem={p} />
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-center" data-interactive="true" onClick={(e) => e.stopPropagation()}>
                          {p.reviewCard ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  data-interactive="true"
                                  className="inline-flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-background/70 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-accent/30 hover:text-foreground"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ReviewIndicator reviewCard={p.reviewCard} />
                                  <span className="text-xs font-medium">Review live</span>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-72 p-3" align="center">
                                <QuickReviewButtons cardId={p.reviewCard.id} size="sm" />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEnrollReview?.(p)}
                              data-interactive="true"
                              disabled={!onEnrollReview}
                              title="Mark for review"
                              className="rounded-full border-border/70 bg-background/70 text-muted-foreground transition-colors hover:bg-accent/30 hover:text-foreground disabled:pointer-events-none"
                            >
                              <Clock className="mr-1.5 h-3.5 w-3.5" />
                              Queue
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="py-4 text-center" data-interactive="true" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center">
                            {p.totalAttempts > 0 ? (
                              <button
                                onClick={() => setAttemptProblem(p)}
                                data-interactive="true"
                                title="Log attempt"
                                aria-label={`Log attempt for ${p.title}`}
                                className="group/attempt inline-flex items-center justify-center"
                              >
                                <Badge
                                  variant="secondary"
                                  className="relative inline-flex min-w-9 items-center justify-center rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-semibold tabular-nums transition-colors group-hover/attempt:bg-foreground group-hover/attempt:text-background"
                                >
                                  <span className="transition-opacity group-hover/attempt:opacity-0">
                                    {p.totalAttempts}
                                  </span>
                                  <Plus className="absolute h-3.5 w-3.5 opacity-0 transition-opacity group-hover/attempt:opacity-100" />
                                </Badge>
                              </button>
                            ) : (
                              <button
                                onClick={() => setAttemptProblem(p)}
                                data-interactive="true"
                                title="Log attempt"
                                aria-label={`Log attempt for ${p.title}`}
                                className="inline-flex items-center gap-1 rounded-full border border-dashed border-border/80 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Log
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-center" data-interactive="true" onClick={(e) => e.stopPropagation()}>
                          <ActionIconButton
                            onClick={() => onDelete?.(p)}
                            data-interactive="true"
                            disabled={!onDelete}
                            title="Remove problem"
                            className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </ActionIconButton>
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
                        {hasNote ? "Open note" : "Create note"}
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
