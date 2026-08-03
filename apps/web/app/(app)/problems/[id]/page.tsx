"use client"

import { use, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink, Plus, StickyNote, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CodeBlock as HighlightedCodeBlock } from "@/components/ui/code-block"
import { MarkdownContent } from "@/components/ui/markdown-content"
import tones from "@/components/ui/tone.module.css"
import { DifficultyBadge } from "@/components/problems/difficulty-badge"
import { StatusBadge } from "@/components/problems/status-badge"
import { AttemptForm } from "@/components/problems/attempt-form"
import { CopyProblemButton } from "@/components/problems/copy-problem-button"
import {
  useProblem,
  useTopics,
  usePatterns,
  useProblems,
  useUpdateProblemStatus,
  useAddTopic,
  useRemoveTopics,
  useAddPattern,
  useRemovePattern,
  useAddRelatedProblem,
} from "@/hooks/use-problems"
import { useDeleteAttempt } from "@/hooks/use-attempts"
import { useEnrollReview, useRemoveReview } from "@/hooks/use-reviews"
import { QuickReviewButtons } from "@/components/review/quick-review-buttons"
import { useNotes } from "@/hooks/use-notes"
import {
  useProblemLists,
  useCreateList,
  useAddProblemToList,
  useRemoveProblemFromList,
} from "@/hooks/use-lists"
import { getListDisplayName, getListHref } from "@/lib/list-display"
import { formatNoteDate, getNewNoteHref, getNoteHref } from "@/lib/note-display"
import { cn } from "@/lib/utils"
import type {
  AttemptDto,
  MistakeType,
  NoteDto,
  PatternDto,
  ProblemListDto,
  ProblemStatus,
  ProblemSummaryDto,
  TopicDto,
} from "@/lib/types"
import styles from "./problem-detail.module.css"

const STATUSES: { value: ProblemStatus; label: string }[] = [
  { value: "UNSEEN", label: "Unseen" },
  { value: "ATTEMPTED", label: "Attempted" },
  { value: "SOLVED_WITH_HELP", label: "Solved w/ Help" },
  { value: "SOLVED", label: "Solved" },
  { value: "MASTERED", label: "Mastered" },
]

const OUTCOME_LABELS: Record<string, string> = {
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  TIME_LIMIT_EXCEEDED: "TLE",
  MEMORY_LIMIT_EXCEEDED: "MLE",
  RUNTIME_ERROR: "Runtime Error",
  NOT_COMPLETED: "Not Completed",
}

const MISTAKE_LABELS: Record<MistakeType, string> = {
  WRONG_PATTERN: "Wrong Pattern",
  OFF_BY_ONE: "Off By One",
  MISSED_EDGE_CASE: "Missed Edge Case",
  FORGOT_BASE_CASE: "Forgot Base Case",
  WRONG_DATA_STRUCTURE: "Wrong Data Structure",
  OVERCOMPLICATED: "Overcomplicated",
  TIMEOUT: "Timeout",
  OVERFLOW: "Overflow",
  WRONG_INITIALIZATION: "Wrong Initialization",
  INCORRECT_LOGIC: "Incorrect Logic",
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / 86400000)
  if (diffDays === 0) return "today"
  if (diffDays === 1) return "tomorrow"
  return `in ${diffDays} days`
}

function formatDuration(minutes: number | null) {
  if (minutes == null) return null
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`
}

function outcomeTone(outcome: AttemptDto["outcome"]) {
  return outcome === "ACCEPTED" ? tones.green : tones.red
}

function formatAttemptMistakes(attempt: AttemptDto) {
  if (attempt.mistakes.length === 0) return "None"
  return attempt.mistakes.map((mistake) => MISTAKE_LABELS[mistake] ?? mistake).join(", ")
}

function Fact({ label, value, caption }: { label: string; value: string | number; caption?: string }) {
  return (
    <div className={styles.fact}>
      <span className={styles.factLabel}>{label}</span>
      <span className={styles.factValue}>{value}</span>
      {caption ? <span className={styles.factCaption}>{caption}</span> : null}
    </div>
  )
}

function AttemptStat({ label, value }: { label: string; value: string | null }) {
  if (!value) return null

  return (
    <div className={styles.attemptStat}>
      <p className={styles.attemptStatLabel}>{label}</p>
      <p className={styles.attemptStatValue}>{value}</p>
    </div>
  )
}

function SelectorGrid({
  options,
  selectedIds,
  onSelect,
  isPending,
}: {
  options: Array<{ id: number; label: string; subtitle?: string }>
  selectedIds: Set<number>
  onSelect: (id: number) => void
  isPending?: boolean
}) {
  if (options.length === 0) {
    return <div className={styles.selectorEmpty}>No options available.</div>
  }

  return (
    <div>
      <p className={styles.selectorCount}>
        {options.length} option{options.length === 1 ? "" : "s"}
      </p>
      <ScrollArea className={styles.selectorScroll}>
        <div className={styles.selectorGrid}>
          {options.map((option) => {
            const isSelected = selectedIds.has(option.id)
            return (
              <button
                key={option.id}
                type="button"
                disabled={isPending || isSelected}
                onClick={() => onSelect(option.id)}
                className={styles.selectorOption}
              >
                <p className={styles.selectorOptionLabel}>{option.label}</p>
                {option.subtitle ? <p className={styles.selectorOptionSubtitle}>{option.subtitle}</p> : null}
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

function AttemptDetails({ attempt }: { attempt: AttemptDto }) {
  return (
    <div>
      <div className={styles.attemptMeta}>
        <span>Attempt #{attempt.attemptNumber}</span>
        <Badge variant="outline" className={cn(tones.tone, outcomeTone(attempt.outcome))}>
          {OUTCOME_LABELS[attempt.outcome] ?? attempt.outcome}
        </Badge>
        <Badge variant="secondary">{attempt.language}</Badge>
      </div>
      <p className={styles.attemptTimestamp}>
        {format(new Date(attempt.createdDate), "MMM d, yyyy 'at' h:mm a")}
        {attempt.startedAt && ` · Started ${format(new Date(attempt.startedAt), "h:mm a")}`}
        {attempt.endedAt && ` · Ended ${format(new Date(attempt.endedAt), "h:mm a")}`}
      </p>
      <div className={styles.attemptStats}>
        <AttemptStat label="Solve time" value={formatDuration(attempt.durationMinutes)} />
        <AttemptStat label="Time complexity" value={attempt.timeComplexity} />
        <AttemptStat label="Space complexity" value={attempt.spaceComplexity} />
        <AttemptStat
          label="Timer"
          value={
            attempt.startedAt && attempt.endedAt
              ? `${format(new Date(attempt.startedAt), "h:mm a")} to ${format(new Date(attempt.endedAt), "h:mm a")}`
              : attempt.startedAt
                ? `Started ${format(new Date(attempt.startedAt), "h:mm a")}`
                : attempt.endedAt
                  ? `Ended ${format(new Date(attempt.endedAt), "h:mm a")}`
                  : null
          }
        />
      </div>
      {attempt.mistakes.length > 0 && (
        <div className={styles.attemptBlock}>
          <p className={styles.attemptBlockLabel}>Mistakes</p>
          <div className={styles.attemptMistakeRow}>
            {attempt.mistakes.map((mistake) => (
              <Badge key={mistake} variant="secondary">
                {MISTAKE_LABELS[mistake] ?? mistake}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {attempt.approach && (
        <div className={styles.attemptBlock}>
          <p className={styles.attemptBlockLabel}>Approach</p>
          <p className={styles.attemptApproach}>{attempt.approach}</p>
        </div>
      )}
      <div className={styles.attemptCode}>
        <HighlightedCodeBlock
          chrome
          showCopyButton
          code={attempt.code?.trim() ? attempt.code : "// No code captured for this attempt."}
          language={attempt.language}
          preClassName={styles.attemptCodePre}
        />
      </div>
      {(attempt.learned || attempt.takeaways || attempt.notes) && (
        <div className={styles.attemptFootNotes}>
          {attempt.learned && (
            <p>
              <strong>Learned: </strong>
              {attempt.learned}
            </p>
          )}
          {attempt.takeaways && (
            <p>
              <strong>Takeaways: </strong>
              {attempt.takeaways}
            </p>
          )}
          {attempt.notes && (
            <p>
              <strong>Notes: </strong>
              {attempt.notes}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function AttemptDetailDialog({
  attempt,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  isDeleting,
}: {
  attempt: AttemptDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (attempt: AttemptDto) => void
  onDelete: (attempt: AttemptDto) => void
  isDeleting: boolean
}) {
  if (!attempt) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.attemptDialog}>
        <DialogHeader className={styles.attemptDialogHead}>
          <DialogTitle>Attempt #{attempt.attemptNumber}</DialogTitle>
          <DialogDescription>Full attempt details, notes, and submitted code.</DialogDescription>
        </DialogHeader>
        <div className={styles.attemptDialogBody}>
          <AttemptDetails attempt={attempt} />
        </div>
        <DialogFooter className={styles.attemptDialogFoot}>
          <Button variant="outline" onClick={() => onEdit(attempt)}>
            Edit
          </Button>
          <Button variant="destructive" onClick={() => onDelete(attempt)} disabled={isDeleting}>
            <Trash2 size={16} />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id: rawId } = use(params)
  const id = Number(rawId)
  const { data: problem, isLoading } = useProblem(id)

  const [attemptFormOpen, setAttemptFormOpen] = useState(false)
  const [editingAttempt, setEditingAttempt] = useState<AttemptDto | undefined>()
  const [selectedAttempt, setSelectedAttempt] = useState<AttemptDto | null>(null)

  const { data: notesData } = useNotes({ problemId: id })
  const notes = [...(notesData?.content ?? [])].sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
  )
  const noteCount = notes.length

  const statusMutation = useUpdateProblemStatus(id)
  const addTopicMutation = useAddTopic(id)
  const removeTopicsMutation = useRemoveTopics(id)
  const addPatternMutation = useAddPattern(id)
  const removePatternMutation = useRemovePattern(id)
  const addRelatedMutation = useAddRelatedProblem(id)
  const deleteAttemptMutation = useDeleteAttempt(id)

  const { data: allLists } = useProblemLists()
  const createListMutation = useCreateList()
  const addToListMutation = useAddProblemToList()
  const removeFromListMutation = useRemoveProblemFromList()

  const enrollReview = useEnrollReview()
  const removeReview = useRemoveReview()

  const { data: allTopics } = useTopics()
  const { data: allPatterns } = usePatterns()
  const { data: allProblems } = useProblems({ size: 200 })

  const [topicModalOpen, setTopicModalOpen] = useState(false)
  const [patternModalOpen, setPatternModalOpen] = useState(false)
  const [relatedModalOpen, setRelatedModalOpen] = useState(false)
  const [listModalOpen, setListModalOpen] = useState(false)

  const [topicSearch, setTopicSearch] = useState("")
  const [patternSearch, setPatternSearch] = useState("")
  const [relatedSearch, setRelatedSearch] = useState("")
  const [newListName, setNewListName] = useState("")

  function handleLogAttempt() {
    setEditingAttempt(undefined)
    setAttemptFormOpen(true)
  }

  async function handleDeleteAttempt(attempt: AttemptDto) {
    try {
      await deleteAttemptMutation.mutateAsync(attempt.id)
      setSelectedAttempt(null)
      toast.success("Attempt deleted")
    } catch {
      toast.error("Failed to delete attempt")
    }
  }

  function handleCreateNote() {
    router.push(getNewNoteHref({ problemId: id, title: problem?.title, returnTo: `/problems/${id}` }))
  }

  function handleOpenNote(note: NoteDto) {
    router.push(getNoteHref(note.id, `/problems/${id}`))
  }

  const topicIds = new Set((problem?.topics ?? []).map((t) => t.id))
  const patternIds = new Set((problem?.patterns ?? []).map((p) => p.id))
  const relatedIds = new Set((problem?.relatedProblems ?? []).map((r) => r.id))

  const topicOptions = [...(allTopics ?? [])]
    .sort((a: TopicDto, b: TopicDto) => a.name.localeCompare(b.name))
    .map((t: TopicDto) => ({ id: t.id, label: t.name }))
  const patternOptions = [...(allPatterns ?? [])]
    .sort((a: PatternDto, b: PatternDto) => a.name.localeCompare(b.name))
    .map((p: PatternDto) => ({
      id: p.id,
      label: p.name,
      subtitle: p.topicName ?? undefined,
    }))
  const topicQuery = topicSearch.trim().toLowerCase()
  const filteredTopicOptions = topicOptions.filter((option) => option.label.toLowerCase().includes(topicQuery))
  const patternQuery = patternSearch.trim().toLowerCase()
  const filteredPatternOptions = patternOptions.filter((option) =>
    `${option.label} ${option.subtitle ?? ""}`.toLowerCase().includes(patternQuery),
  )
  const relatedOptions = (allProblems?.content ?? [])
    .filter((p: ProblemSummaryDto) => p.id !== id)
    .map((p: ProblemSummaryDto) => ({
      id: p.id,
      label: `#${p.leetcodeId} ${p.title}`,
      subtitle: p.difficulty,
    }))
  const relatedQuery = relatedSearch.trim().toLowerCase()
  const filteredRelatedOptions = relatedOptions.filter((option) => option.label.toLowerCase().includes(relatedQuery))

  async function handleAddTopic(topicId: number) {
    try {
      await addTopicMutation.mutateAsync(topicId)
      toast.success("Topic added")
      setTopicSearch("")
      setTopicModalOpen(false)
    } catch {
      toast.error("Failed to add topic")
    }
  }

  async function handleAddPattern(patternId: number) {
    try {
      await addPatternMutation.mutateAsync(patternId)
      toast.success("Pattern added")
      setPatternSearch("")
      setPatternModalOpen(false)
    } catch {
      toast.error("Failed to add pattern")
    }
  }

  async function handleAddRelated(relatedId: number) {
    try {
      await addRelatedMutation.mutateAsync(relatedId)
      toast.success("Related problem added")
      setRelatedModalOpen(false)
    } catch {
      toast.error("Failed to add related problem")
    }
  }

  const problemListIds = new Set(
    (allLists ?? [])
      .filter((l: ProblemListDto) => l.problems.some((p) => p.id === id))
      .map((l: ProblemListDto) => l.id),
  )
  const problemLists = (allLists ?? []).filter((l: ProblemListDto) => problemListIds.has(l.id))
  const listOptions = (allLists ?? []).map((l: ProblemListDto) => ({ id: l.id, label: l.name }))

  async function handleAddToList(listId: number) {
    try {
      await addToListMutation.mutateAsync({ listId, problemId: id })
      toast.success("Added to list")
      setListModalOpen(false)
    } catch {
      toast.error("Failed to add to list")
    }
  }

  async function handleRemoveFromList(listId: number) {
    try {
      await removeFromListMutation.mutateAsync({ listId, problemId: id })
      toast.success("Removed from list")
    } catch {
      toast.error("Failed to remove from list")
    }
  }

  async function handleCreateList() {
    const name = newListName.trim()
    if (!name) {
      toast.error("List name is required")
      return
    }
    try {
      const created = await createListMutation.mutateAsync({ name })
      await addToListMutation.mutateAsync({ listId: created.id, problemId: id })
      toast.success("List created and problem added")
      setNewListName("")
      setListModalOpen(false)
    } catch {
      toast.error("Failed to create list")
    }
  }

  if (isLoading) {
    return (
      <div className={styles.skeletons}>
        <Skeleton className={styles.skeletonTitle} />
        <Skeleton className={styles.skeletonMeta} />
        <Skeleton className={styles.skeletonBody} />
      </div>
    )
  }

  if (!problem) {
    return <div className={styles.notFound}>Problem not found.</div>
  }

  const problemListNames = problemLists.map((list) => getListDisplayName(list))
  const attempts = [...problem.attempts].sort(
    (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
  )
  const latestAttempt = attempts[0] ?? null
  const acceptedAttempts = attempts.filter((attempt) => attempt.outcome === "ACCEPTED").length
  const totalSolveMinutes = attempts.reduce((sum, attempt) => sum + (attempt.durationMinutes ?? 0), 0)
  const reviewNow = new Date()
  const reviewDueDate = problem.reviewCard ? new Date(problem.reviewCard.due) : null
  const isReviewDue = reviewDueDate ? reviewDueDate <= reviewNow : false
  const reviewDueText = reviewDueDate
    ? reviewDueDate < reviewNow
      ? `Overdue by ${Math.ceil((reviewNow.getTime() - reviewDueDate.getTime()) / 86400000)}d`
      : `Due ${formatRelativeDate(reviewDueDate)}`
    : null

  return (
    <div className={styles.page}>
      <Button variant="ghost" size="sm" asChild className={styles.back}>
        <Link href="/problems">
          <ArrowLeft size={16} />
          Back
        </Link>
      </Button>

      <div className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.leetcodeId}>#{problem.leetcodeId}</p>
          <h1 className={styles.title}>{problem.title}</h1>
          <div className={styles.badgeRow}>
            <DifficultyBadge difficulty={problem.difficulty} />
            <StatusBadge status={problem.status} />
            {problem.reviewCard ? (
              <Badge variant="outline" className={styles.reviewChip}>
                {problem.reviewCard.state}
                {reviewDueText ? <span className={styles.reviewChipDue}>{reviewDueText}</span> : null}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className={styles.headerActions}>
          <Button variant="outline" size="sm" onClick={handleCreateNote}>
            <StickyNote size={16} />
            Create note
          </Button>
          <Button size="sm" onClick={handleLogAttempt}>
            <Plus size={16} />
            Log attempt
          </Button>
          <CopyProblemButton
            problemId={id}
            problem={problem}
            notes={notesData?.content}
            listNames={problemListNames}
            variant="outline"
            label="Copy details"
            title="Copy problem details"
          />
        </div>
      </div>

      <div className={styles.facts}>
        <Fact
          label="Attempts"
          value={attempts.length}
          caption={latestAttempt ? `Last on ${format(new Date(latestAttempt.createdDate), "MMM d, yyyy")}` : "None yet"}
        />
        <Fact label="Accepted" value={acceptedAttempts} caption="Successful submissions" />
        <Fact label="Notes" value={noteCount} caption={noteCount > 0 ? "Attached to this problem" : "None yet"} />
        <Fact label="Solve time" value={formatDuration(totalSolveMinutes) ?? "—"} caption="Combined across attempts" />
      </div>

      <div className={styles.grid}>
        <div className={styles.main}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <p className={styles.panelTitle}>Notes</p>
                <p className={styles.panelNote}>Keep strategy, review, and interview notes attached to this problem.</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleCreateNote}>
                <StickyNote size={16} />
                Add note
              </Button>
            </div>
            <div className={styles.panelBody}>
              {noteCount > 0 ? (
                <div className={styles.noteGrid}>
                  {notes.map((note) => (
                    <button key={note.id} type="button" onClick={() => handleOpenNote(note)} className={styles.noteCard}>
                      <div className={styles.noteCardHead}>
                        <div>
                          <p className={styles.noteCardTitle}>{note.title}</p>
                          <p className={styles.noteCardMeta}>
                            {note.tag} &middot; {formatNoteDate(note.dateTime)}
                          </p>
                        </div>
                        <span className={styles.noteCardOpen}>Open</span>
                      </div>
                      <div className={styles.noteCardExcerpt}>
                        <MarkdownContent content={note.content} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.empty}>
                  <p>No notes attached yet.</p>
                  <Button variant="outline" size="sm" onClick={handleCreateNote}>
                    <StickyNote size={16} />
                    Create note
                  </Button>
                </div>
              )}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <p className={styles.panelTitle}>Attempts</p>
                <p className={styles.panelNote}>Track outcomes, mistakes, and the quality of each solve.</p>
              </div>
              <Button size="sm" onClick={handleLogAttempt}>
                <Plus size={16} />
                Log attempt
              </Button>
            </div>
            <div className={styles.panelBody}>
              {attempts.length === 0 ? (
                <div className={styles.empty}>
                  <p>No attempts yet.</p>
                  <Button size="sm" variant="outline" onClick={handleLogAttempt}>
                    <Plus size={16} />
                    Log first attempt
                  </Button>
                </div>
              ) : (
                <div className={styles.tableShell}>
                  <Table>
                    <TableHeader>
                      <TableRow className={styles.headRow}>
                        <TableHead className={styles.headCellCenter}>#</TableHead>
                        <TableHead className={styles.headCell}>Approach</TableHead>
                        <TableHead className={styles.headCellCenter}>Result</TableHead>
                        <TableHead className={styles.headCellCenter}>Time</TableHead>
                        <TableHead className={styles.headCellCenter}>Space</TableHead>
                        <TableHead className={styles.headCellCenter}>Mistakes</TableHead>
                        <TableHead className={styles.headCellCenter}>Solve time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attempts.map((attempt) => (
                        <TableRow key={attempt.id} className={styles.row} onClick={() => setSelectedAttempt(attempt)}>
                          <TableCell className={styles.cellCenter}>#{attempt.attemptNumber}</TableCell>
                          <TableCell className={styles.cell}>
                            <span className={styles.approach}>{attempt.approach ?? "—"}</span>
                          </TableCell>
                          <TableCell className={styles.cellCenter}>
                            <Badge variant="outline" className={cn(tones.tone, outcomeTone(attempt.outcome))}>
                              {OUTCOME_LABELS[attempt.outcome] ?? attempt.outcome}
                            </Badge>
                          </TableCell>
                          <TableCell className={styles.cellCenter}>{attempt.timeComplexity ?? "—"}</TableCell>
                          <TableCell className={styles.cellCenter}>{attempt.spaceComplexity ?? "—"}</TableCell>
                          <TableCell className={styles.cellCenter}>{formatAttemptMistakes(attempt)}</TableCell>
                          <TableCell className={styles.cellCenter}>{formatDuration(attempt.durationMinutes) ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className={styles.aside}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <p className={styles.panelTitle}>Metadata</p>
              </div>
              <Select value={problem.status} onValueChange={(v) => statusMutation.mutate(v)}>
                <SelectTrigger hideIcon disabled={statusMutation.isPending} className={styles.statusTrigger}>
                  <SelectValue>
                    <StatusBadge status={problem.status} />
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <StatusBadge status={s.value} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={styles.metaBody}>
              <div className={styles.metaBlock}>
                <p className={styles.metaLabel}>Reference</p>
                <a href={problem.url} target="_blank" rel="noopener noreferrer" className={styles.referenceLink}>
                  <ExternalLink size={14} />
                  <span>{problem.url.replace("https://", "")}</span>
                </a>
              </div>

              <div className={styles.metaBlock}>
                <p className={styles.metaLabel}>Topics</p>
                <div className={cn(styles.chipRow, styles.metaContent)}>
                  {problem.topics.map((t) => (
                    <span key={t.id} className={styles.chip}>
                      {t.name}
                      <button onClick={() => removeTopicsMutation.mutate([t.id])} className={styles.chipRemove}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <button onClick={() => setTopicModalOpen(true)} className={styles.chipAdd}>
                    <Plus size={10} />
                    Add
                  </button>
                </div>
              </div>

              <div className={styles.metaBlock}>
                <p className={styles.metaLabel}>Patterns</p>
                <div className={cn(styles.listRow, styles.metaContent)}>
                  {problem.patterns.map((p) => (
                    <div key={p.id} className={styles.entryRow}>
                      <div className={styles.entryText}>
                        <p className={styles.entryTitle}>{p.name}</p>
                        {p.topicName ? <p className={styles.entrySubtitle}>{p.topicName}</p> : null}
                      </div>
                      <button onClick={() => removePatternMutation.mutate(p.id)} className={styles.entryRemove}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setPatternModalOpen(true)} className={styles.chipAdd}>
                    <Plus size={10} />
                    Add
                  </button>
                </div>
              </div>

              <div className={styles.metaBlock}>
                <p className={styles.metaLabel}>Related problems</p>
                <div className={cn(styles.listRow, styles.metaContent)}>
                  {problem.relatedProblems.map((r) => (
                    <Link key={r.id} href={`/problems/${r.id}`} className={styles.entryRow}>
                      <div className={styles.entryText}>
                        <p className={styles.entryTitle}>
                          #{r.leetcodeId} {r.title}
                        </p>
                      </div>
                      <DifficultyBadge difficulty={r.difficulty} />
                    </Link>
                  ))}
                  <button onClick={() => setRelatedModalOpen(true)} className={styles.chipAdd}>
                    <Plus size={10} />
                    Add
                  </button>
                </div>
              </div>

              <div className={styles.metaBlock}>
                <p className={styles.metaLabel}>Lists</p>
                <div className={cn(styles.chipRow, styles.metaContent)}>
                  {problemLists.map((l) => (
                    <span key={l.id} className={styles.chip}>
                      <Link href={getListHref(l)}>{getListDisplayName(l)}</Link>
                      <button onClick={() => handleRemoveFromList(l.id)} className={styles.chipRemove}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <button onClick={() => setListModalOpen(true)} className={styles.chipAdd}>
                    <Plus size={10} />
                    Add
                  </button>
                </div>
              </div>

              <div className={styles.metaBlock}>
                <p className={styles.metaLabel}>Revision</p>
                <div className={styles.metaContent}>
                  {problem.reviewCard ? (
                    <>
                      <div className={styles.revisionRow}>
                        <div className={styles.revisionMeta}>
                          <Badge variant="outline">{problem.reviewCard.state}</Badge>
                          {reviewDueText ? <span>{reviewDueText}</span> : null}
                          <span>{problem.reviewCard.reps} reviews</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className={styles.revisionRemove}
                          onClick={() => removeReview.mutate(problem.reviewCard!.id)}
                          disabled={removeReview.isPending}
                          title="Remove from review"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                      {isReviewDue ? (
                        <div className={styles.reviewButtons}>
                          <QuickReviewButtons cardId={problem.reviewCard.id} />
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <button
                      onClick={() => enrollReview.mutate(problem.id)}
                      disabled={enrollReview.isPending}
                      className={styles.chipAdd}
                    >
                      <Plus size={10} />
                      Add to review
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <AttemptForm open={attemptFormOpen} onOpenChange={setAttemptFormOpen} problemId={id} attempt={editingAttempt} />

      <AttemptDetailDialog
        attempt={selectedAttempt}
        open={selectedAttempt !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAttempt(null)
        }}
        onEdit={(attempt) => {
          setSelectedAttempt(null)
          setEditingAttempt(attempt)
          setAttemptFormOpen(true)
        }}
        onDelete={handleDeleteAttempt}
        isDeleting={deleteAttemptMutation.isPending}
      />

      <Dialog open={topicModalOpen} onOpenChange={setTopicModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add topics</DialogTitle>
            <DialogDescription>Select from the predefined topic catalog.</DialogDescription>
          </DialogHeader>
          <Input value={topicSearch} onChange={(e) => setTopicSearch(e.target.value)} placeholder="Search topics..." />
          <SelectorGrid
            options={filteredTopicOptions}
            selectedIds={topicIds}
            onSelect={handleAddTopic}
            isPending={addTopicMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={patternModalOpen} onOpenChange={setPatternModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add patterns</DialogTitle>
            <DialogDescription>Select from the predefined pattern catalog.</DialogDescription>
          </DialogHeader>
          <Input value={patternSearch} onChange={(e) => setPatternSearch(e.target.value)} placeholder="Search patterns..." />
          <SelectorGrid
            options={filteredPatternOptions}
            selectedIds={patternIds}
            onSelect={handleAddPattern}
            isPending={addPatternMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={relatedModalOpen} onOpenChange={setRelatedModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add related problem</DialogTitle>
            <DialogDescription>Search and add a related problem.</DialogDescription>
          </DialogHeader>
          <Input
            value={relatedSearch}
            onChange={(e) => setRelatedSearch(e.target.value)}
            placeholder="Search by title or LeetCode number..."
          />
          <div className={styles.relatedList}>
            {filteredRelatedOptions.length === 0 ? (
              <p className={styles.selectorEmpty}>No matching problems found.</p>
            ) : (
              filteredRelatedOptions.map((option) => {
                const selected = relatedIds.has(option.id)
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={selected || addRelatedMutation.isPending}
                    onClick={() => handleAddRelated(option.id)}
                    className={styles.relatedOption}
                  >
                    <span className={styles.relatedOptionLabel}>{option.label}</span>
                    <span className={styles.relatedOptionMeta}>{selected ? "Added" : option.subtitle}</span>
                  </button>
                )
              })
            )}
          </div>
          <div className={styles.dialogHint}>
            <p>Need a problem that is not here yet?</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/problems">Create new problem</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={listModalOpen} onOpenChange={setListModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to list</DialogTitle>
            <DialogDescription>Select a list to add this problem to, or create a new one.</DialogDescription>
          </DialogHeader>
          <SelectorGrid
            options={listOptions}
            selectedIds={problemListIds}
            onSelect={handleAddToList}
            isPending={addToListMutation.isPending}
          />
          <div className={styles.newListPanel}>
            <p className={styles.newListTitle}>Create new list</p>
            <div className={styles.newListField}>
              <Label htmlFor="new-list-name">Name</Label>
              <Input
                id="new-list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g. Blind 75"
              />
            </div>
            <div className={styles.newListActions}>
              <Button onClick={handleCreateList} disabled={createListMutation.isPending || addToListMutation.isPending}>
                Create and add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
