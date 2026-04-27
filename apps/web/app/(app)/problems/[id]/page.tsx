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

function getOutcomeBadgeClass(outcome: AttemptDto["outcome"]) {
  return outcome === "ACCEPTED"
    ? "border-green-200 bg-green-50 text-green-700"
    : "border-red-200 bg-red-50 text-red-700"
}

function formatAttemptMistakes(attempt: AttemptDto) {
  if (attempt.mistakes.length === 0) return "None"
  return attempt.mistakes.map((mistake) => MISTAKE_LABELS[mistake] ?? mistake).join(", ")
}

function AttemptStat({
  label,
  value,
}: {
  label: string
  value: string | null
}) {
  if (!value) return null

  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}

function SurfaceSection({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card/80 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-3 border-b border-border/70 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ── Meta Row ──────────────────────────────────────────────────────────────────

function MetaRow({
  label,
  children,
  align = "start",
}: {
  label: string
  children: React.ReactNode
  align?: "start" | "center"
}) {
  return (
    <div
      className={`flex gap-0 border-b px-3 py-2 last:border-b-0 ${
        align === "center" ? "items-center" : "items-start"
      }`}
    >
      <span
        className={`w-24 shrink-0 select-none text-xs text-muted-foreground ${
          align === "center" ? "" : "pt-0.5"
        }`}
      >
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
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
    return (
      <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
        No options available.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {options.length} option{options.length === 1 ? "" : "s"}
      </p>
      <ScrollArea className="h-80 rounded-md border">
        <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2">
          {options.map((option) => {
            const isSelected = selectedIds.has(option.id)
            return (
              <button
                key={option.id}
                type="button"
                disabled={isPending || isSelected}
                onClick={() => onSelect(option.id)}
                className="rounded-md border px-3 py-2 text-left transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <p className="truncate text-xs font-medium">{option.label}</p>
                {option.subtitle ? (
                  <p className="truncate text-[11px] text-muted-foreground">{option.subtitle}</p>
                ) : null}
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

// ── Code Block ────────────────────────────────────────────────────────────────

function AttemptCodeBlock({
  language,
  code,
}: {
  language: string
  code: string | null
}) {
  const content = code?.trim() ? code : "// No code captured for this attempt."

  return (
    <HighlightedCodeBlock
      chrome
      showCopyButton
      code={content}
      language={language}
      preClassName="max-h-64 overflow-y-auto"
    />
  )
}

function AttemptDetails({
  attempt,
}: {
  attempt: AttemptDto
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Attempt #{attempt.attemptNumber}</span>
        <Badge
          variant="outline"
          className={getOutcomeBadgeClass(attempt.outcome)}
        >
          {OUTCOME_LABELS[attempt.outcome] ?? attempt.outcome}
        </Badge>
        <Badge variant="secondary">{attempt.language}</Badge>
      </div>
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          {format(new Date(attempt.createdDate), "MMM d, yyyy 'at' h:mm a")}
          {attempt.startedAt && ` · Started ${format(new Date(attempt.startedAt), "h:mm a")}`}
          {attempt.endedAt && ` · Ended ${format(new Date(attempt.endedAt), "h:mm a")}`}
        </p>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <AttemptStat label="Solve Time" value={formatDuration(attempt.durationMinutes)} />
          <AttemptStat label="Time Complexity" value={attempt.timeComplexity} />
          <AttemptStat label="Space Complexity" value={attempt.spaceComplexity} />
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
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Mistakes</p>
            <div className="flex flex-wrap gap-2">
              {attempt.mistakes.map((mistake) => (
                <Badge key={mistake} variant="secondary" className="font-medium">
                  {MISTAKE_LABELS[mistake] ?? mistake}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {attempt.approach && (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Approach</p>
            <p className="text-sm whitespace-pre-wrap">{attempt.approach}</p>
          </div>
        )}
          <AttemptCodeBlock language={attempt.language} code={attempt.code} />
        {(attempt.learned || attempt.takeaways || attempt.notes) && (
          <div className="space-y-1.5 text-sm">
            {attempt.learned && (
              <p><span className="font-medium">Learned: </span>{attempt.learned}</p>
            )}
            {attempt.takeaways && (
              <p><span className="font-medium">Takeaways: </span>{attempt.takeaways}</p>
            )}
            {attempt.notes && (
              <p><span className="font-medium">Notes: </span>{attempt.notes}</p>
            )}
          </div>
        )}
      </div>
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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Attempt #{attempt.attemptNumber}</DialogTitle>
          <DialogDescription>
            Full attempt details, notes, and submitted code.
          </DialogDescription>
        </DialogHeader>
        <AttemptDetails attempt={attempt} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onEdit(attempt)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete(attempt)}
            disabled={isDeleting}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id: rawId } = use(params)
  const id = Number(rawId)
  const { data: problem, isLoading } = useProblem(id)

  // Attempt form
  const [attemptFormOpen, setAttemptFormOpen] = useState(false)
  const [editingAttempt, setEditingAttempt] = useState<AttemptDto | undefined>()
  const [selectedAttempt, setSelectedAttempt] = useState<AttemptDto | null>(null)

  // Note
  const { data: notesData } = useNotes({ problemId: id })
  const notes = [...(notesData?.content ?? [])].sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
  )
  const noteCount = notes.length

  // Mutations
  const statusMutation = useUpdateProblemStatus(id)
  const addTopicMutation = useAddTopic(id)
  const removeTopicsMutation = useRemoveTopics(id)
  const addPatternMutation = useAddPattern(id)
  const removePatternMutation = useRemovePattern(id)
  const addRelatedMutation = useAddRelatedProblem(id)
  const deleteAttemptMutation = useDeleteAttempt(id)

  // Lists
  const { data: allLists } = useProblemLists()
  const createListMutation = useCreateList()
  const addToListMutation = useAddProblemToList()
  const removeFromListMutation = useRemoveProblemFromList()

  // Review
  const enrollReview = useEnrollReview()
  const removeReview = useRemoveReview()

  // Data for selects
  const { data: allTopics } = useTopics()
  const { data: allPatterns } = usePatterns()
  const { data: allProblems } = useProblems({ size: 200 })

  // Metadata selector modals
  const [topicModalOpen, setTopicModalOpen] = useState(false)
  const [patternModalOpen, setPatternModalOpen] = useState(false)
  const [relatedModalOpen, setRelatedModalOpen] = useState(false)
  const [listModalOpen, setListModalOpen] = useState(false)

  // Selector filters
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
  const filteredTopicOptions = topicOptions.filter((option) =>
    option.label.toLowerCase().includes(topicQuery),
  )
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
  const filteredRelatedOptions = relatedOptions.filter((option) =>
    option.label.toLowerCase().includes(relatedQuery),
  )

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

  // Lists: derive which lists contain this problem
  const problemListIds = new Set(
    (allLists ?? [])
      .filter((l: ProblemListDto) => l.problems.some((p) => p.id === id))
      .map((l: ProblemListDto) => l.id),
  )
  const problemLists = (allLists ?? []).filter((l: ProblemListDto) =>
    problemListIds.has(l.id),
  )
  const listOptions = (allLists ?? []).map((l: ProblemListDto) => ({
    id: l.id,
    label: l.name,
  }))

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
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Problem not found.
      </div>
    )
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
    <div className="w-full space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 rounded-full">
        <Link href="/problems">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>
      </Button>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px] xl:items-start">
        <div className="space-y-6">
          <div
            className="overflow-hidden rounded-[30px] border border-border/70 shadow-[0_30px_90px_color-mix(in_oklab,var(--foreground)_12%,transparent)]"
            style={{
              background: [
                "radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 34%)",
                "radial-gradient(circle at 86% 22%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 30%)",
                "linear-gradient(145deg, color-mix(in srgb, var(--card) 90%, var(--background) 10%), color-mix(in srgb, var(--background) 92%, var(--card) 8%))",
              ].join(", "),
            }}
          >
            <div className="space-y-6 p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 max-w-3xl space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Problem Workspace
                  </div>
                  <div className="space-y-2">
                    <p className="font-mono text-sm text-muted-foreground">#{problem.leetcodeId}</p>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                      {problem.title}
                    </h1>
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                      Keep the full context for this problem in one place: attempts, notes, review state, and metadata that should actually help you study.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <DifficultyBadge difficulty={problem.difficulty} />
                    <StatusBadge status={problem.status} />
                    {problem.reviewCard ? (
                      <Badge variant="outline" className="rounded-full border-border/70 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                        {problem.reviewCard.state}
                        {reviewDueText ? <span className="ml-2 text-foreground">{reviewDueText}</span> : null}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button variant="outline" onClick={handleCreateNote} className="rounded-full">
                    <StickyNote className="mr-2 h-4 w-4" />
                    Create Note
                  </Button>
                  <Button onClick={handleLogAttempt} className="rounded-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Log Attempt
                  </Button>
                  <CopyProblemButton
                    problemId={id}
                    problem={problem}
                    notes={notesData?.content}
                    listNames={problemListNames}
                    variant="outline"
                    className="shrink-0 rounded-full"
                    label="Copy details"
                    title="Copy problem details"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Attempts</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">{attempts.length}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {latestAttempt ? `Last on ${format(new Date(latestAttempt.createdDate), "MMM d, yyyy")}` : "No attempts logged yet"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Accepted</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">{acceptedAttempts}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Successful submissions captured here.</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Notes</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">{noteCount}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {noteCount > 0 ? "Strategy, review, and learning context attached." : "No written notes yet."}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Solve Time</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">{formatDuration(totalSolveMinutes) ?? "—"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Combined logged duration across attempts.</p>
                </div>
              </div>
            </div>
          </div>

          <SurfaceSection
            eyebrow="Attached Notes"
            title={`Notes (${noteCount})`}
            description="Keep multiple strategy, review, and interview notes attached to this problem."
            actions={
              <Button variant="outline" size="sm" onClick={handleCreateNote} className="rounded-full">
                <StickyNote className="mr-1.5 h-4 w-4" />
                Add Note
              </Button>
            }
          >
            {noteCount > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {notes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => handleOpenNote(note)}
                    className="rounded-2xl border border-border/70 bg-background/70 p-4 text-left transition-colors hover:border-border hover:bg-background"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-medium leading-snug text-foreground">{note.title}</p>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {note.tag} · {formatNoteDate(note.dateTime)}
                        </p>
                      </div>
                      <span className="rounded-full border border-border/70 bg-card/80 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        Open
                      </span>
                    </div>
                    <div className="mt-3 line-clamp-5 text-sm text-muted-foreground">
                      <MarkdownContent content={note.content} />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-background/40 text-sm text-muted-foreground">
                <p>No notes attached yet.</p>
                <Button variant="outline" size="sm" onClick={handleCreateNote} className="rounded-full">
                  <StickyNote className="mr-1.5 h-4 w-4" />
                  Create Note
                </Button>
              </div>
            )}
          </SurfaceSection>

          <SurfaceSection
            eyebrow="Attempt History"
            title={`Attempts (${problem.attempts.length})`}
            description="Track outcomes, mistakes, and the quality of each solve rather than just whether it passed."
            actions={
              <Button size="sm" onClick={handleLogAttempt} className="rounded-full">
                <Plus className="mr-1.5 h-4 w-4" />
                Log Attempt
              </Button>
            }
          >
            {problem.attempts.length === 0 ? (
              <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-background/40 text-sm text-muted-foreground">
                <p>No attempts yet.</p>
                <Button size="sm" variant="outline" onClick={handleLogAttempt} className="rounded-full">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Log first attempt
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {latestAttempt ? (
                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Latest Result</p>
                      <div className="mt-3">
                        <Badge variant="outline" className={getOutcomeBadgeClass(latestAttempt.outcome)}>
                          {OUTCOME_LABELS[latestAttempt.outcome] ?? latestAttempt.outcome}
                        </Badge>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Latest Attempt</p>
                      <p className="mt-3 text-lg font-semibold text-foreground">
                        {format(new Date(latestAttempt.createdDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Duration</p>
                      <p className="mt-3 text-lg font-semibold text-foreground">
                        {formatDuration(latestAttempt.durationMinutes) ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Mistakes</p>
                      <p className="mt-3 line-clamp-2 text-sm font-medium text-foreground">
                        {formatAttemptMistakes(latestAttempt)}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="overflow-hidden rounded-2xl border border-border/70">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-background/65">
                        <TableHead className="w-20 text-center">#</TableHead>
                        <TableHead className="w-36 text-center">Result</TableHead>
                        <TableHead className="w-36 text-center">Time Complexity</TableHead>
                        <TableHead className="w-36 text-center">Space Complexity</TableHead>
                        <TableHead className="text-center">Mistakes</TableHead>
                        <TableHead className="w-28 text-center">Solve Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attempts.map((attempt) => (
                        <TableRow
                          key={attempt.id}
                          className="cursor-pointer transition-colors hover:bg-accent/20"
                          onClick={() => setSelectedAttempt(attempt)}
                        >
                          <TableCell className="text-center font-medium">#{attempt.attemptNumber}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={getOutcomeBadgeClass(attempt.outcome)}
                            >
                              {OUTCOME_LABELS[attempt.outcome] ?? attempt.outcome}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground">
                            {attempt.timeComplexity ?? "—"}
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground">
                            {attempt.spaceComplexity ?? "—"}
                          </TableCell>
                          <TableCell className="max-w-md text-center text-sm text-muted-foreground">
                            {formatAttemptMistakes(attempt)}
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground">
                            {formatDuration(attempt.durationMinutes) ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </SurfaceSection>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card/80 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            <div className="border-b border-border/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Problem Metadata
              </p>
            </div>

            {/* Status */}
            <MetaRow label="status" align="center">
              <Select value={problem.status} onValueChange={(v) => statusMutation.mutate(v)}>
                <SelectTrigger
                  size="sm"
                  hideIcon
                  disabled={statusMutation.isPending}
                  className="inline-flex h-6 min-h-0 w-fit cursor-pointer items-center border-0 bg-transparent p-0 leading-none shadow-none transition-opacity hover:opacity-80 focus-visible:ring-0 data-[state=open]:opacity-80"
                >
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
            </MetaRow>

            {/* Difficulty */}
            <MetaRow label="difficulty" align="center">
              <DifficultyBadge difficulty={problem.difficulty} />
            </MetaRow>

            {/* LeetCode link */}
            <MetaRow label="leetcode" align="center">
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" />
                {problem.url.replace("https://", "")}
              </a>
            </MetaRow>

            {/* Topics */}
            <MetaRow label="topics">
              <div className="flex flex-wrap items-center gap-1.5">
                {problem.topics.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
                  >
                    {t.name}
                    <button
                      onClick={() => removeTopicsMutation.mutate([t.id])}
                      className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => setTopicModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <Plus className="h-2.5 w-2.5" />
                  Add
                </button>
              </div>
            </MetaRow>

            {/* Patterns */}
            <MetaRow label="patterns">
              <div className="space-y-1">
                {problem.patterns.map((p) => (
                  <div key={p.id} className="group/item flex items-center justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-1.5">
                      <span className="text-xs font-medium">{p.name}</span>
                      {p.topicName && (
                        <span className="text-xs text-muted-foreground">· {p.topicName}</span>
                      )}
                    </div>
                    <button
                      onClick={() => removePatternMutation.mutate(p.id)}
                      className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover/item:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setPatternModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <Plus className="h-2.5 w-2.5" />
                  Add
                </button>
              </div>
            </MetaRow>

            {/* Related */}
            <MetaRow label="related">
              <div className="space-y-1">
                {problem.relatedProblems.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Link
                        href={`/problems/${r.id}`}
                        className="truncate text-xs font-medium hover:underline"
                      >
                        #{r.leetcodeId} {r.title}
                      </Link>
                      <DifficultyBadge difficulty={r.difficulty} />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setRelatedModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <Plus className="h-2.5 w-2.5" />
                  Add
                </button>
              </div>
            </MetaRow>

            {/* Lists */}
            <MetaRow label="lists">
              <div className="flex flex-wrap items-center gap-1.5">
                {problemLists.map((l) => (
                  <span
                    key={l.id}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
                  >
                    <Link href={getListHref(l)} className="hover:underline">
                      {getListDisplayName(l)}
                    </Link>
                    <button
                      onClick={() => handleRemoveFromList(l.id)}
                      className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => setListModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <Plus className="h-2.5 w-2.5" />
                  Add
                </button>
              </div>
            </MetaRow>

            {/* Revision */}
            <MetaRow label="revision">
              {problem.reviewCard ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {problem.reviewCard.state}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {reviewDueText}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {problem.reviewCard.reps} reviews
                    </span>
                  </div>
                  {isReviewDue && (
                    <QuickReviewButtons cardId={problem.reviewCard.id} />
                  )}
                  <div className="flex justify-end">
                    <button
                      onClick={() => removeReview.mutate(problem.reviewCard!.id)}
                      disabled={removeReview.isPending}
                      className="inline-flex text-muted-foreground transition-colors hover:text-destructive"
                      title="Remove from review"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => enrollReview.mutate(problem.id)}
                  disabled={enrollReview.isPending}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <Plus className="h-2.5 w-2.5" />
                  Add to Review
                </button>
              )}
            </MetaRow>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card/80 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            <div className="border-b border-border/70 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Study Snapshot
              </p>
            </div>
            <div className="grid gap-3 p-4">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Latest Attempt</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {latestAttempt ? format(new Date(latestAttempt.createdDate), "MMM d, yyyy") : "None yet"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {latestAttempt ? `${OUTCOME_LABELS[latestAttempt.outcome] ?? latestAttempt.outcome} in ${formatDuration(latestAttempt.durationMinutes) ?? "—"}` : "Open a first attempt to start building history."}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Related Context</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {problem.relatedProblems.length} related
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {problem.topics.length} topics and {problem.patterns.length} patterns attached.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <AttemptForm
        open={attemptFormOpen}
        onOpenChange={setAttemptFormOpen}
        problemId={id}
        attempt={editingAttempt}
      />

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
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Topics</DialogTitle>
            <DialogDescription>Select from the predefined topic catalog.</DialogDescription>
          </DialogHeader>
          <Input
            value={topicSearch}
            onChange={(e) => setTopicSearch(e.target.value)}
            placeholder="Search topics..."
          />
          <SelectorGrid
            options={filteredTopicOptions}
            selectedIds={topicIds}
            onSelect={handleAddTopic}
            isPending={addTopicMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={patternModalOpen} onOpenChange={setPatternModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Patterns</DialogTitle>
            <DialogDescription>Select from the predefined pattern catalog.</DialogDescription>
          </DialogHeader>
          <Input
            value={patternSearch}
            onChange={(e) => setPatternSearch(e.target.value)}
            placeholder="Search patterns..."
          />
          <SelectorGrid
            options={filteredPatternOptions}
            selectedIds={patternIds}
            onSelect={handleAddPattern}
            isPending={addPatternMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={relatedModalOpen} onOpenChange={setRelatedModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Related Problem</DialogTitle>
            <DialogDescription>Search and add a related problem.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={relatedSearch}
              onChange={(e) => setRelatedSearch(e.target.value)}
              placeholder="Search by title or LeetCode number..."
            />
            <div className="max-h-80 space-y-1 overflow-y-auto rounded-md border p-2">
              {filteredRelatedOptions.length === 0 ? (
                <p className="px-2 py-2 text-xs text-muted-foreground">No matching problems found.</p>
              ) : (
                filteredRelatedOptions.map((option) => {
                  const selected = relatedIds.has(option.id)
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={selected || addRelatedMutation.isPending}
                      onClick={() => handleAddRelated(option.id)}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="truncate pr-2">{option.label}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {selected ? "Added" : option.subtitle}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-dashed p-3">
            <p className="text-xs text-muted-foreground">Need a problem that is not here yet?</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/problems">Create New Problem</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={listModalOpen} onOpenChange={setListModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add to List</DialogTitle>
            <DialogDescription>Select a list to add this problem to, or create a new one.</DialogDescription>
          </DialogHeader>
          <SelectorGrid
            options={listOptions}
            selectedIds={problemListIds}
            onSelect={handleAddToList}
            isPending={addToListMutation.isPending}
          />
          <div className="space-y-2 rounded-md border border-dashed p-3">
            <p className="text-xs font-medium">Create new list</p>
            <div className="space-y-1">
              <Label htmlFor="new-list-name">Name</Label>
              <Input
                id="new-list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g. Blind 75"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleCreateList}
                disabled={createListMutation.isPending || addToListMutation.isPending}
              >
                Create and Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
