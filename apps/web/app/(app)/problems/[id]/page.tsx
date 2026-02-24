"use client"

import { use, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Check, Copy, ExternalLink, Plus, StickyNote, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { DifficultyBadge } from "@/components/problems/difficulty-badge"
import { StatusBadge } from "@/components/problems/status-badge"
import { AttemptForm } from "@/components/problems/attempt-form"
import { NoteEditorDialog } from "@/components/notes/note-editor-dialog"
import { useProblem } from "@/hooks/use-problems"
import { useDeleteAttempt } from "@/hooks/use-attempts"
import type {
  AttemptDto,
  NoteDto,
  NoteTag,
  PatternDto,
  ProblemDetailDto,
  ProblemSummaryDto,
  TopicDto,
} from "@/lib/types"

// TODO: remove once real API is wired up
const DUMMY_PROBLEMS: Record<number, ProblemDetailDto> = {
  1: {
    id: 1,
    leetcodeId: 1,
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/",
    difficulty: "EASY",
    status: "MASTERED",
    topics: [
      { id: 1, name: "Array", description: "Linear collection of elements." },
      { id: 2, name: "Hash Table", description: "Key-value lookup structure." },
    ],
    patterns: [
      { id: 1, name: "Hash Map Lookup", description: "Store complements in a map for O(1) lookup.", topicId: 2, topicName: "Hash Table", namedAlgorithm: false },
      { id: 2, name: "Two Pass vs One Pass", description: "Solve in a single iteration by checking as you build.", topicId: 1, topicName: "Array", namedAlgorithm: false },
    ],
    relatedProblems: [
      { id: 9, leetcodeId: 15, title: "3Sum", url: "https://leetcode.com/problems/3sum/", difficulty: "MEDIUM", status: "SOLVED" },
      { id: 15, leetcodeId: 167, title: "Two Sum II", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", difficulty: "MEDIUM", status: "UNSEEN" },
    ],
    attempts: [
      {
        id: 1, problemId: 1, attemptNumber: 1, language: "PYTHON", outcome: "WRONG_ANSWER",
        durationMinutes: 12, timeComplexity: "O(n²)", spaceComplexity: "O(1)", aiReview: null,
        learned: "Brute force works but is too slow for large inputs.", takeaways: null,
        notes: "Nested loop — check every pair.",
        mistakes: [{ id: 1, type: "LOGIC", description: "Did not handle duplicate indices correctly." }],
        createdDate: "2025-11-10T14:30:00Z",
        code: `def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]`,
      },
      {
        id: 2, problemId: 1, attemptNumber: 2, language: "PYTHON", outcome: "ACCEPTED",
        durationMinutes: 8, timeComplexity: "O(n)", spaceComplexity: "O(n)", aiReview: null,
        learned: "Use a hash map to store (value → index) as you iterate. Check complement on each step.",
        takeaways: "One-pass hash map is the canonical O(n) solution for two-sum-style problems.",
        notes: null, mistakes: [], createdDate: "2025-11-12T09:15:00Z",
        code: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i`,
      },
    ],
  },
}

const OUTCOME_LABELS: Record<string, string> = {
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  TIME_LIMIT_EXCEEDED: "TLE",
  MEMORY_LIMIT_EXCEEDED: "MLE",
  RUNTIME_ERROR: "Runtime Error",
  NOT_COMPLETED: "Not Completed",
}

// ── Code Block ────────────────────────────────────────────────────────────────

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="flex items-center justify-between bg-muted px-3 py-1.5 border-b">
        <span className="text-xs font-medium text-muted-foreground">
          {language.charAt(0) + language.slice(1).toLowerCase()}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed font-mono max-h-64 overflow-y-auto">
        <code>{code}</code>
      </pre>
    </div>
  )
}

// ── Attempt Card ──────────────────────────────────────────────────────────────

function AttemptCard({
  attempt,
  problemId,
  onEdit,
}: {
  attempt: AttemptDto
  problemId: number
  onEdit: (a: AttemptDto) => void
}) {
  const deleteMutation = useDeleteAttempt(problemId)

  async function handleDelete() {
    if (!confirm("Delete this attempt?")) return
    try {
      await deleteMutation.mutateAsync(attempt.id)
      toast.success("Attempt deleted")
    } catch {
      toast.error("Failed to delete attempt")
    }
  }

  return (
    <Card className="group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Attempt #{attempt.attemptNumber}</span>
            <Badge
              variant="outline"
              className={
                attempt.outcome === "ACCEPTED"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }
            >
              {OUTCOME_LABELS[attempt.outcome] ?? attempt.outcome}
            </Badge>
            <Badge variant="secondary">{attempt.language}</Badge>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={() => onEdit(attempt)}>Edit</Button>
            <Button
              variant="ghost" size="sm"
              className="text-destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {format(new Date(attempt.createdDate), "MMM d, yyyy 'at' h:mm a")}
          {attempt.durationMinutes && ` · ${attempt.durationMinutes}m`}
          {attempt.timeComplexity && ` · T: ${attempt.timeComplexity}`}
          {attempt.spaceComplexity && ` · S: ${attempt.spaceComplexity}`}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Code block */}
        <CodeBlock language={attempt.language} code={attempt.code} />

        {/* Reflections */}
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
      </CardContent>
    </Card>
  )
}

// ── Inline add input ──────────────────────────────────────────────────────────

function InlineAdd({
  placeholder,
  onAdd,
  onCancel,
}: {
  placeholder: string
  onAdd: (value: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState("")
  function commit() {
    const v = value.trim()
    if (v) onAdd(v)
    setValue("")
  }
  return (
    <div className="flex items-center gap-1.5">
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit()
          if (e.key === "Escape") onCancel()
        }}
        placeholder={placeholder}
        className="h-7 text-xs"
      />
      <Button size="sm" className="h-7 px-2 text-xs" onClick={commit}>Add</Button>
      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onCancel}>
        <X className="h-3 w-3" />
      </Button>
    </div>
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
  const { data: apiProblem, isLoading } = useProblem(id)
  const problem = apiProblem ?? DUMMY_PROBLEMS[id]

  // Attempt form
  const [attemptFormOpen, setAttemptFormOpen] = useState(false)
  const [editingAttempt, setEditingAttempt] = useState<AttemptDto | undefined>()

  // Note
  const [note, setNote] = useState<NoteDto | undefined>()
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)

  // Editable metadata (local state; replace with mutations when API is wired)
  const [topics, setTopics] = useState<TopicDto[]>(() => DUMMY_PROBLEMS[id]?.topics ?? [])
  const [patterns, setPatterns] = useState<PatternDto[]>(() => DUMMY_PROBLEMS[id]?.patterns ?? [])
  const [related, setRelated] = useState<ProblemSummaryDto[]>(() => DUMMY_PROBLEMS[id]?.relatedProblems ?? [])

  // Add input toggles
  const [addingTopic, setAddingTopic] = useState(false)
  const [addingPattern, setAddingPattern] = useState(false)
  const [addingRelated, setAddingRelated] = useState(false)

  function handleLogAttempt() {
    setEditingAttempt(undefined)
    setAttemptFormOpen(true)
  }

  function handleNoteSave({ tag, title, content }: { tag: NoteTag; title: string; content: string }) {
    setNote((prev) =>
      prev
        ? { ...prev, tag, title, content }
        : { id: Date.now(), problemId: id, dateTime: new Date().toISOString(), tag, title, content }
    )
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

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/problems">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">#{problem.leetcodeId}</span>
            <h1 className="text-2xl font-semibold">{problem.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={problem.difficulty} />
            <StatusBadge status={problem.status} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
            title="View on LeetCode"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <Button size="sm" onClick={handleLogAttempt}>
            <Plus className="mr-1.5 h-4 w-4" />
            Log Attempt
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-[1fr_280px] gap-8 items-start">

        {/* ── Left: Attempts ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Attempts ({problem.attempts.length})
            </h2>
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
            <div className="space-y-3">
              {problem.attempts.map((a) => (
                <AttemptCard
                  key={a.id}
                  attempt={a}
                  problemId={id}
                  onEdit={(a) => { setEditingAttempt(a); setAttemptFormOpen(true) }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Sidebar ──────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Note */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Note</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              {note ? (
                <button
                  onClick={() => setNoteDialogOpen(true)}
                  className="w-full text-left rounded-md border bg-muted/40 p-3 hover:bg-muted/60 transition-colors"
                >
                  <p className="text-xs font-medium leading-snug">{note.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {note.content}
                  </p>
                </button>
              ) : (
                <button
                  onClick={() => setNoteDialogOpen(true)}
                  className="flex w-full items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                >
                  <StickyNote className="h-4 w-4" />
                  Add a note
                </button>
              )}
            </CardContent>
          </Card>

          {/* Topics */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Topics</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {topics.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
                  >
                    {t.name}
                    <button
                      onClick={() => setTopics((prev) => prev.filter((x) => x.id !== t.id))}
                      className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              {addingTopic ? (
                <InlineAdd
                  placeholder="Topic name..."
                  onAdd={(name) => {
                    setTopics((prev) => [...prev, { id: Date.now(), name, description: "" }])
                    setAddingTopic(false)
                  }}
                  onCancel={() => setAddingTopic(false)}
                />
              ) : (
                <button
                  onClick={() => setAddingTopic(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-2.5 w-2.5" />
                  Add topic
                </button>
              )}
            </CardContent>
          </Card>

          {/* Patterns */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Patterns</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4 space-y-2">
              <div className="space-y-1.5">
                {patterns.map((p) => (
                  <div key={p.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-snug">{p.name}</p>
                      {p.topicName && (
                        <p className="text-xs text-muted-foreground">{p.topicName}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setPatterns((prev) => prev.filter((x) => x.id !== p.id))}
                      className="shrink-0 rounded hover:bg-muted p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              {addingPattern ? (
                <InlineAdd
                  placeholder="Pattern name..."
                  onAdd={(name) => {
                    setPatterns((prev) => [
                      ...prev,
                      { id: Date.now(), name, description: "", topicId: null, topicName: null, namedAlgorithm: false },
                    ])
                    setAddingPattern(false)
                  }}
                  onCancel={() => setAddingPattern(false)}
                />
              ) : (
                <button
                  onClick={() => setAddingPattern(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-2.5 w-2.5" />
                  Add pattern
                </button>
              )}
            </CardContent>
          </Card>

          {/* Related Problems */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Related</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4 space-y-2">
              <div className="space-y-1.5">
                {related.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Link
                        href={`/problems/${r.id}`}
                        className="text-xs font-medium hover:underline truncate"
                      >
                        #{r.leetcodeId} {r.title}
                      </Link>
                      <DifficultyBadge difficulty={r.difficulty} />
                    </div>
                    <button
                      onClick={() => setRelated((prev) => prev.filter((x) => x.id !== r.id))}
                      className="shrink-0 rounded hover:bg-muted p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              {addingRelated ? (
                <InlineAdd
                  placeholder="Problem title..."
                  onAdd={(title) => {
                    setRelated((prev) => [
                      ...prev,
                      { id: Date.now(), leetcodeId: 0, title, url: "", difficulty: "MEDIUM", status: "UNSEEN" },
                    ])
                    setAddingRelated(false)
                  }}
                  onCancel={() => setAddingRelated(false)}
                />
              ) : (
                <button
                  onClick={() => setAddingRelated(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-2.5 w-2.5" />
                  Add related
                </button>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      <AttemptForm
        open={attemptFormOpen}
        onOpenChange={setAttemptFormOpen}
        problemId={id}
        attempt={editingAttempt}
      />

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
