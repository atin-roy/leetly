"use client"

import { use, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { CodeBlock as HighlightedCodeBlock } from "@/components/ui/code-block"
import { MarkdownContent } from "@/components/ui/markdown-content"
import { DifficultyBadge } from "@/components/problems/difficulty-badge"
import { StatusBadge } from "@/components/problems/status-badge"
import { AttemptForm } from "@/components/problems/attempt-form"
import { CopyProblemButton } from "@/components/problems/copy-problem-button"
import { NoteEditorDialog } from "@/components/notes/note-editor-dialog"
import {
  useProblem,
  useTopics,
  usePatterns,
  useProblems,
  useCreateTopic,
  useCreatePattern,
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
import { useNotes, useCreateNote, useUpdateNote } from "@/hooks/use-notes"
import {
  useProblemLists,
  useCreateList,
  useAddProblemToList,
  useRemoveProblemFromList,
} from "@/hooks/use-lists"
import { getListDisplayName, getListHref } from "@/lib/list-display"
import type {
  AttemptDto,
  MistakeType,
  PatternDto,
  ProblemListDto,
  NoteTag,
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

function formatAttemptComplexities(attempt: AttemptDto) {
  const time = attempt.timeComplexity ?? "?"
  const space = attempt.spaceComplexity ?? "?"
  return `${time} / ${space}`
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
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
  const { id: rawId } = use(params)
  const id = Number(rawId)
  const { data: problem, isLoading } = useProblem(id)

  // Attempt form
  const [attemptFormOpen, setAttemptFormOpen] = useState(false)
  const [editingAttempt, setEditingAttempt] = useState<AttemptDto | undefined>()
  const [selectedAttempt, setSelectedAttempt] = useState<AttemptDto | null>(null)

  // Note
  const { data: notesData } = useNotes({ problemId: id })
  const note = notesData?.content?.[0]
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const createNoteMutation = useCreateNote()
  const updateNoteMutation = useUpdateNote()

  // Mutations
  const statusMutation = useUpdateProblemStatus(id)
  const addTopicMutation = useAddTopic(id)
  const removeTopicsMutation = useRemoveTopics(id)
  const createTopicMutation = useCreateTopic()
  const addPatternMutation = useAddPattern(id)
  const removePatternMutation = useRemovePattern(id)
  const createPatternMutation = useCreatePattern()
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

  // Create flows inside selector modals
  const [newTopicName, setNewTopicName] = useState("")
  const [newTopicDescription, setNewTopicDescription] = useState("")
  const [newPatternName, setNewPatternName] = useState("")
  const [newPatternDescription, setNewPatternDescription] = useState("")
  const [newPatternTopicId, setNewPatternTopicId] = useState<string>("none")
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

  async function handleNoteSave({ tag, title, content }: { tag: NoteTag; title: string; content: string }) {
    try {
      if (note) {
        await updateNoteMutation.mutateAsync({ id: note.id, body: { tag, title, content } })
      } else {
        await createNoteMutation.mutateAsync({ problemId: id, tag, title, content })
      }
      toast.success(note ? "Note updated" : "Note created")
    } catch {
      toast.error("Failed to save note")
    }
  }

  const topicIds = new Set((problem?.topics ?? []).map((t) => t.id))
  const patternIds = new Set((problem?.patterns ?? []).map((p) => p.id))
  const relatedIds = new Set((problem?.relatedProblems ?? []).map((r) => r.id))

  const topicOptions = (allTopics ?? []).map((t: TopicDto) => ({ id: t.id, label: t.name }))
  const patternOptions = (allPatterns ?? []).map((p: PatternDto) => ({
    id: p.id,
    label: p.name,
    subtitle: p.topicName ?? undefined,
  }))
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
      setTopicModalOpen(false)
    } catch {
      toast.error("Failed to add topic")
    }
  }

  async function handleCreateTopic() {
    const name = newTopicName.trim()
    if (!name) {
      toast.error("Topic name is required")
      return
    }
    try {
      const created = await createTopicMutation.mutateAsync({
        name,
        description: newTopicDescription.trim() || undefined,
      })
      await addTopicMutation.mutateAsync(created.id)
      toast.success("Topic created and added")
      setNewTopicName("")
      setNewTopicDescription("")
      setTopicModalOpen(false)
    } catch {
      toast.error("Failed to create topic")
    }
  }

  async function handleAddPattern(patternId: number) {
    try {
      await addPatternMutation.mutateAsync(patternId)
      toast.success("Pattern added")
      setPatternModalOpen(false)
    } catch {
      toast.error("Failed to add pattern")
    }
  }

  async function handleCreatePattern() {
    const name = newPatternName.trim()
    if (!name) {
      toast.error("Pattern name is required")
      return
    }
    try {
      const created = await createPatternMutation.mutateAsync({
        name,
        description: newPatternDescription.trim() || undefined,
        topicId: newPatternTopicId === "none" ? null : Number(newPatternTopicId),
        namedAlgorithm: false,
      })
      await addPatternMutation.mutateAsync(created.id)
      toast.success("Pattern created and added")
      setNewPatternName("")
      setNewPatternDescription("")
      setNewPatternTopicId("none")
      setPatternModalOpen(false)
    } catch {
      toast.error("Failed to create pattern")
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
  const reviewNow = new Date()
  const reviewDueDate = problem.reviewCard ? new Date(problem.reviewCard.due) : null
  const isReviewDue = reviewDueDate ? reviewDueDate <= reviewNow : false
  const reviewDueText = reviewDueDate
    ? reviewDueDate < reviewNow
      ? `Overdue by ${Math.ceil((reviewNow.getTime() - reviewDueDate.getTime()) / 86400000)}d`
      : `Due ${formatRelativeDate(reviewDueDate)}`
    : null

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/problems">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="min-w-0">
          <p className="font-mono text-sm text-muted-foreground">#{problem.leetcodeId}</p>
          <h1 className="mt-1 text-2xl font-semibold">{problem.title}</h1>
        </div>
        <div className="flex justify-center">
          <CopyProblemButton
            problemId={id}
            problem={problem}
            notes={notesData?.content}
            listNames={problemListNames}
            variant="outline"
            className="shrink-0"
            label="Copy details"
            title="Copy problem details"
          />
        </div>
      </div>

      {/* Properties — Obsidian metadata style */}
      <div className="rounded-lg border text-sm">

        {/* Status */}
        <MetaRow label="status" align="center">
          <Select value={problem.status} onValueChange={(v) => statusMutation.mutate(v)}>
            <SelectTrigger
              hideIcon
              disabled={statusMutation.isPending}
              className="inline-flex h-auto w-fit cursor-pointer items-center border-0 bg-transparent p-0 shadow-none transition-opacity hover:opacity-80 focus-visible:ring-0 data-[state=open]:opacity-80"
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
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
                  className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
            <button
              onClick={() => setTopicModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
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
              <div key={p.id} className="flex items-center justify-between gap-2 group/item">
                <div className="min-w-0 flex items-center gap-1.5">
                  <span className="text-xs font-medium">{p.name}</span>
                  {p.topicName && (
                    <span className="text-xs text-muted-foreground">· {p.topicName}</span>
                  )}
                </div>
                <button
                  onClick={() => removePatternMutation.mutate(p.id)}
                  className="opacity-0 group-hover/item:opacity-100 shrink-0 rounded hover:bg-muted p-0.5 text-muted-foreground hover:text-foreground transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setPatternModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
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
                <div className="flex items-center gap-2 min-w-0">
                  <Link
                    href={`/problems/${r.id}`}
                    className="text-xs font-medium hover:underline truncate"
                  >
                    #{r.leetcodeId} {r.title}
                  </Link>
                  <DifficultyBadge difficulty={r.difficulty} />
                </div>
              </div>
            ))}
            <button
              onClick={() => setRelatedModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
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
                  className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
            <button
              onClick={() => setListModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-2.5 w-2.5" />
              Add
            </button>
          </div>
        </MetaRow>

        {/* Revision */}
        <MetaRow label="revision" align="center">
          {problem.reviewCard ? (
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {problem.reviewCard.state}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {reviewDueText}
              </span>
              <span className="text-xs text-muted-foreground">
                {problem.reviewCard.reps} reviews
              </span>
              {isReviewDue && (
                <QuickReviewButtons cardId={problem.reviewCard.id} />
              )}
              <button
                onClick={() => removeReview.mutate(problem.reviewCard!.id)}
                disabled={removeReview.isPending}
                className="inline-flex text-muted-foreground hover:text-destructive transition-colors"
                title="Remove from review"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => enrollReview.mutate(problem.id)}
              disabled={enrollReview.isPending}
              className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-2.5 w-2.5" />
              Add to Review
            </button>
          )}
        </MetaRow>

      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Note
          </h2>
          <Button variant="outline" size="sm" onClick={() => setNoteDialogOpen(true)}>
            <StickyNote className="mr-1.5 h-4 w-4" />
            {note ? "Edit Note" : "Create Note"}
          </Button>
        </div>
        <div className="space-y-2">
          {note ? (
            <>
              <p className="text-sm font-medium leading-snug">{note.title}</p>
              <MarkdownContent content={note.content} className="text-sm text-muted-foreground" />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No note yet.
            </p>
          )}
        </div>
      </div>

      {/* Attempts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Attempts ({problem.attempts.length})
          </h2>
          <Button size="sm" onClick={handleLogAttempt}>
            <Plus className="mr-1.5 h-4 w-4" />
            Log Attempt
          </Button>
        </div>

        {problem.attempts.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-sm text-muted-foreground">
            <p>No attempts yet.</p>
            <Button size="sm" variant="outline" onClick={handleLogAttempt}>
              <Plus className="mr-1.5 h-4 w-4" />
              Log first attempt
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">#</TableHead>
                  <TableHead className="w-32">Result</TableHead>
                  <TableHead>Complexities</TableHead>
                  <TableHead>Mistakes</TableHead>
                  <TableHead className="w-28 text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((attempt) => (
                  <TableRow
                    key={attempt.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedAttempt(attempt)}
                  >
                    <TableCell className="font-medium">#{attempt.attemptNumber}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getOutcomeBadgeClass(attempt.outcome)}
                      >
                        {OUTCOME_LABELS[attempt.outcome] ?? attempt.outcome}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatAttemptComplexities(attempt)}
                    </TableCell>
                    <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                      {formatAttemptMistakes(attempt)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {formatDuration(attempt.durationMinutes) ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
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
            <DialogDescription>Select one topic from the grid to add it to this problem.</DialogDescription>
          </DialogHeader>
          <SelectorGrid
            options={topicOptions}
            selectedIds={topicIds}
            onSelect={handleAddTopic}
            isPending={addTopicMutation.isPending}
          />
          <div className="space-y-2 rounded-md border border-dashed p-3">
            <p className="text-xs font-medium">Create new topic</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="new-topic-name">Name</Label>
                <Input
                  id="new-topic-name"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="e.g. Backtracking"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="new-topic-description">Description</Label>
                <Textarea
                  id="new-topic-description"
                  value={newTopicDescription}
                  onChange={(e) => setNewTopicDescription(e.target.value)}
                  className="min-h-20"
                  placeholder="Short description (optional)"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCreateTopic} disabled={createTopicMutation.isPending || addTopicMutation.isPending}>
                Create and Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={patternModalOpen} onOpenChange={setPatternModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Patterns</DialogTitle>
            <DialogDescription>Select one pattern from the grid to add it to this problem.</DialogDescription>
          </DialogHeader>
          <SelectorGrid
            options={patternOptions}
            selectedIds={patternIds}
            onSelect={handleAddPattern}
            isPending={addPatternMutation.isPending}
          />
          <div className="space-y-2 rounded-md border border-dashed p-3">
            <p className="text-xs font-medium">Create new pattern</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="new-pattern-name">Name</Label>
                <Input
                  id="new-pattern-name"
                  value={newPatternName}
                  onChange={(e) => setNewPatternName(e.target.value)}
                  placeholder="e.g. Two Pointers"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-pattern-topic">Topic</Label>
                <Select value={newPatternTopicId} onValueChange={setNewPatternTopicId}>
                  <SelectTrigger id="new-pattern-topic">
                    <SelectValue placeholder="Optional topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {(allTopics ?? []).map((topic) => (
                      <SelectItem key={topic.id} value={String(topic.id)}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="new-pattern-description">Description</Label>
                <Textarea
                  id="new-pattern-description"
                  value={newPatternDescription}
                  onChange={(e) => setNewPatternDescription(e.target.value)}
                  className="min-h-20"
                  placeholder="Short description (optional)"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleCreatePattern}
                disabled={createPatternMutation.isPending || addPatternMutation.isPending}
              >
                Create and Add
              </Button>
            </div>
          </div>
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

      <NoteEditorDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        note={note}
        initialMode={note ? "view" : "edit"}
        defaultTitle={problem.title}
        onSave={handleNoteSave}
      />
    </div>
  )
}
