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
import tones from "@/components/ui/tone.module.css"
import { cn } from "@/lib/utils"
import { AttemptForm } from "./attempt-form"
import { CopyProblemButton } from "./copy-problem-button"
import { DifficultyBadge } from "./difficulty-badge"
import { statusLabels, statusStyles } from "./status-badge"
import styles from "./problem-table.module.css"
import type { ProblemStatus, ProblemSummaryDto } from "@/lib/types"

const COLS = 6
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
    <TableRow className={styles.fillerRow}>
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
    <div data-interactive="true" className={styles.statusCell} onClick={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          data-interactive="true"
          aria-label={`Change status for ${problem.title}`}
          disabled={statusMutation.isPending}
          onClick={(e) => e.stopPropagation()}
          className={styles.statusTrigger}
        >
          <Badge variant="outline" className={cn(statusStyles[status], styles.statusTriggerBadge)}>
            {statusLabels[status]}
          </Badge>
        </PopoverTrigger>
        <PopoverContent className={styles.statusPopover} align="center">
          <div className={styles.statusList}>
            {STATUSES.map((option) => (
              <button
                key={option}
                onClick={() => handleChange(option)}
                className={styles.statusOption}
              >
                <Check
                  className={cn(
                    styles.statusCheck,
                    option !== status && styles.statusCheckHidden,
                  )}
                />
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
      className={cn(styles.iconButton, className)}
      {...props}
    >
      {children}
    </Button>
  )
}

function ProblemUtilityActions({ problem, hasNote, onNoteClick }: ProblemActionProps) {
  return (
    <div className={styles.utilityActions} data-interactive="true" onClick={(e) => e.stopPropagation()}>
      <ActionIconButton asChild title="Open in LeetCode">
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          data-interactive="true"
        >
          <ExternalLink />
        </a>
      </ActionIconButton>
      <ActionIconButton
        onClick={() => onNoteClick?.(problem)}
        data-interactive="true"
        disabled={!onNoteClick}
        title={hasNote ? "Open note" : "Create note"}
        className={hasNote ? styles.iconButtonNoted : undefined}
      >
        <StickyNote className={hasNote ? styles.notedIcon : undefined} />
      </ActionIconButton>
      <CopyProblemButton
        problemId={problem.id}
        size="icon"
        showText={false}
        title="Copy full problem details"
        className={styles.iconButton}
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
      <TableRow className={styles.headRow}>
        <TableHead className={cn(styles.headCell, styles.colProblem)}>Problem</TableHead>
        <TableHead className={cn(styles.headCell, styles.colActivity)}>Last Activity</TableHead>
        <TableHead className={cn(styles.headCellCenter, styles.colProgress)}>Progress</TableHead>
        <TableHead className={cn(styles.headCellCenter, styles.colReview)}>Review</TableHead>
        <TableHead className={cn(styles.headCellCenter, styles.colAttempts)}>Attempts</TableHead>
        <TableHead className={styles.colGutter} />
      </TableRow>
    </TableHeader>
  )

  if (isLoading) {
    return (
      <>
        <div className={styles.cards}>
          {Array.from({ length: Math.min(pageSize, 6) }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton className={styles.skeletonLineShort} />
              <Skeleton className={styles.skeletonLineTitle} />
              <div className={styles.skeletonPills}>
                <Skeleton className={styles.skeletonPillSm} />
                <Skeleton className={styles.skeletonPillLg} />
              </div>
              <div className={styles.pairGrid}>
                <Skeleton className={styles.skeletonBox} />
                <Skeleton className={styles.skeletonBox} />
              </div>
              <div className={styles.skeletonTriple}>
                <Skeleton className={styles.skeletonAction} />
                <Skeleton className={styles.skeletonAction} />
                <Skeleton className={styles.skeletonAction} />
              </div>
            </div>
          ))}
        </div>

        <Table className={styles.table}>
          {header}
          <TableBody>
            {Array.from({ length: pageSize }).map((_, i) => (
              <TableRow key={i} className={styles.fillerRow}>
                {Array.from({ length: COLS }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className={styles.skeletonCellLine} />
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
      <div className={styles.cards}>
        {rows.length === 0 ? (
          <div className={styles.empty}>No problems found.</div>
        ) : (
          rows.map((p) => {
            const hasNote = notedProblemIds?.has(p.id) ?? false

            return (
              <article key={p.id} className={styles.card}>
                <div className={styles.cardBody} onClick={() => openProblem(p.id)}>
                  <div className={styles.cardHead}>
                    <div className={styles.cardHeadText}>
                      <div className={styles.metaLine}>
                        <span className={styles.leetcodeId}>#{p.leetcodeId}</span>
                        <span>{formatLastAttemptDetail(p.lastAttemptedAt)}</span>
                      </div>
                      <h3 className={styles.cardTitle}>{p.title}</h3>
                    </div>

                    <ProblemUtilityActions
                      problem={p}
                      hasNote={hasNote}
                      onNoteClick={onNoteClick}
                    />
                  </div>

                  <div className={styles.badgeRow}>
                    <DifficultyBadge difficulty={p.difficulty} />
                    <StatusCell problem={p} />
                    {p.reviewCard ? (
                      <Badge
                        variant="outline"
                        className={cn(styles.reviewBadge, tones.tone, tones.green)}
                      >
                        In review
                      </Badge>
                    ) : null}
                  </div>

                  <div className={styles.pairGrid} data-interactive="true" onClick={(e) => e.stopPropagation()}>
                    <div className={styles.statBox}>
                      <p className={styles.statLabel}>Last Attempt</p>
                      <p className={styles.statValue}>{formatLastAttempt(p.lastAttemptedAt)}</p>
                    </div>
                    <div className={styles.statBox}>
                      <p className={styles.statLabel}>Attempts</p>
                      <p className={styles.statValue}>
                        {p.totalAttempts > 0 ? `${p.totalAttempts} logged` : "None yet"}
                      </p>
                    </div>
                  </div>

                  <div className={styles.pairGrid} data-interactive="true" onClick={(e) => e.stopPropagation()}>
                    {p.reviewCard ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={styles.cardButton}
                            data-interactive="true"
                          >
                            <ReviewIndicator reviewCard={p.reviewCard} />
                            Review
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className={styles.reviewPopoverMobile} align="center">
                          <QuickReviewButtons cardId={p.reviewCard.id} size="sm" />
                          {onRemoveReview ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={styles.removeReviewButton}
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
                        className={styles.cardButton}
                        onClick={() => onEnrollReview?.(p)}
                        data-interactive="true"
                        disabled={!onEnrollReview}
                      >
                        <Clock />
                        Queue Review
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className={styles.cardButton}
                      onClick={() => setAttemptProblem(p)}
                      data-interactive="true"
                    >
                      <Plus />
                      {p.totalAttempts > 0 ? "Log Again" : "Log Attempt"}
                    </Button>
                  </div>

                  <div className={styles.pairGrid} data-interactive="true" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      className={styles.cardGhostButton}
                      onClick={() => openProblem(p.id)}
                    >
                      Open Detail
                    </Button>
                    <Button
                      variant="ghost"
                      className={cn(styles.cardGhostButton, styles.cardDangerButton)}
                      onClick={() => onDelete?.(p)}
                      disabled={!onDelete}
                    >
                      <Trash2 />
                      Remove
                    </Button>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </div>

      <Table className={styles.table}>
        {header}
        <TableBody>
          {rows.length === 0 ? (
            <>
              <TableRow className={styles.fillerRow}>
                <TableCell colSpan={COLS} className={styles.emptyCell}>
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
                        className={styles.row}
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
                        <TableCell className={styles.cell}>
                          <div className={styles.titleBlock}>
                            <div className={styles.titleText}>
                              <div className={styles.metaLine}>
                                <span className={styles.leetcodeId}>#{p.leetcodeId}</span>
                                <span>{formatLastAttemptDetail(p.lastAttemptedAt)}</span>
                              </div>
                              <p className={styles.rowTitle}>{p.title}</p>
                            </div>

                            <ProblemUtilityActions
                              problem={p}
                              hasNote={hasNote}
                              onNoteClick={onNoteClick}
                            />
                          </div>
                        </TableCell>
                        <TableCell className={styles.cell}>
                          <p className={styles.activityPrimary}>{formatLastAttempt(p.lastAttemptedAt)}</p>
                          <p className={styles.activitySecondary}>
                            {p.totalAttempts > 0 ? `${p.totalAttempts} logged attempt${p.totalAttempts === 1 ? "" : "s"}` : "Fresh in backlog"}
                          </p>
                        </TableCell>
                        <TableCell className={styles.cellCenter} data-interactive="true" onClick={(e) => e.stopPropagation()}>
                          <div className={styles.progressStack}>
                            <DifficultyBadge difficulty={p.difficulty} />
                            <StatusCell problem={p} />
                          </div>
                        </TableCell>
                        <TableCell className={styles.cellCenter} data-interactive="true" onClick={(e) => e.stopPropagation()}>
                          {p.reviewCard ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  data-interactive="true"
                                  className={styles.reviewTrigger}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ReviewIndicator reviewCard={p.reviewCard} />
                                  <span className={styles.reviewTriggerLabel}>Review live</span>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className={styles.reviewPopover} align="center">
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
                              className={styles.queueButton}
                            >
                              <Clock />
                              Queue
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className={styles.cellCenter} data-interactive="true" onClick={(e) => e.stopPropagation()}>
                          <div className={styles.attemptsCell}>
                            {p.totalAttempts > 0 ? (
                              <button
                                onClick={() => setAttemptProblem(p)}
                                data-interactive="true"
                                title="Log attempt"
                                aria-label={`Log attempt for ${p.title}`}
                                className={styles.attemptCountButton}
                              >
                                <Badge variant="secondary" className={styles.attemptCountBadge}>
                                  <span className={styles.attemptCountValue}>
                                    {p.totalAttempts}
                                  </span>
                                  <Plus className={styles.attemptCountPlus} />
                                </Badge>
                              </button>
                            ) : (
                              <button
                                onClick={() => setAttemptProblem(p)}
                                data-interactive="true"
                                title="Log attempt"
                                aria-label={`Log attempt for ${p.title}`}
                                className={styles.attemptLogButton}
                              >
                                <Plus size={14} />
                                Log
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={styles.cellCenter} data-interactive="true" onClick={(e) => e.stopPropagation()}>
                          <ActionIconButton
                            onClick={() => onDelete?.(p)}
                            data-interactive="true"
                            disabled={!onDelete}
                            title="Remove problem"
                            className={styles.deleteButton}
                          >
                            <Trash2 />
                          </ActionIconButton>
                        </TableCell>
                      </TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
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
