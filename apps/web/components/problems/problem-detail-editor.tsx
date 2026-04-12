"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, Pencil, Plus } from "lucide-react"
import { HeroPanel, SectionHeader } from "@/components/demo/surfaces"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { DemoProblemDetail } from "@/lib/demo-data"

type AttemptOutcome = "Accepted" | "Wrong Answer" | "Time Limit" | "Runtime Error" | "Abandoned"

type EditableAttempt = DemoProblemDetail["attempts"][number] & {
  code: string
}

type Approach = {
  id: number
  name: string
  summary: string
  complexity: string
  notes: string
  code: string
}

type AttemptDraft = {
  label: string
  outcome: AttemptOutcome
  date: string
  duration: string
  language: string
  insight: string
  mistakes: string
  code: string
}

type ApproachDraft = {
  name: string
  summary: string
  complexity: string
  notes: string
  code: string
}

const ATTEMPT_OUTCOMES: AttemptOutcome[] = ["Accepted", "Wrong Answer", "Time Limit", "Runtime Error", "Abandoned"]

function createAttemptDraft(language: string): AttemptDraft {
  return {
    label: "",
    outcome: "Accepted",
    date: "",
    duration: "",
    language,
    insight: "",
    mistakes: "",
    code: "",
  }
}

function createApproachDraft(): ApproachDraft {
  return {
    name: "",
    summary: "",
    complexity: "",
    notes: "",
    code: "",
  }
}

function AttemptComposer({
  draft,
  onChange,
  onCancel,
  onSave,
  saveLabel,
}: {
  draft: AttemptDraft
  onChange: (patch: Partial<AttemptDraft>) => void
  onCancel: () => void
  onSave: () => void
  saveLabel: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--border-default)] bg-[var(--surface-card)] p-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input
          value={draft.label}
          onChange={(event) => onChange({ label: event.target.value })}
          placeholder="Attempt name"
        />
        <Select value={draft.outcome} onValueChange={(value) => onChange({ outcome: value as AttemptOutcome })}>
          <SelectTrigger className="w-full rounded-[1.15rem]">
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent>
            {ATTEMPT_OUTCOMES.map((outcome) => (
              <SelectItem key={outcome} value={outcome}>{outcome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={draft.date}
          onChange={(event) => onChange({ date: event.target.value })}
          placeholder="Date"
        />
        <Input
          value={draft.duration}
          onChange={(event) => onChange({ duration: event.target.value })}
          placeholder="Duration"
        />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Input
          value={draft.language}
          onChange={(event) => onChange({ language: event.target.value })}
          placeholder="Language"
        />
        <Input
          value={draft.mistakes}
          onChange={(event) => onChange({ mistakes: event.target.value })}
          placeholder="Mistakes, comma separated"
        />
      </div>

      <div className="mt-3 space-y-3">
        <Textarea
          value={draft.insight}
          onChange={(event) => onChange({ insight: event.target.value })}
          placeholder="What happened in this attempt?"
          className="min-h-24"
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--text-muted)]">Code</p>
            <p className="text-xs text-[var(--text-muted)]">Paste the attempt code here.</p>
          </div>
          <Textarea
            value={draft.code}
            onChange={(event) => onChange({ code: event.target.value })}
            placeholder="Paste code for this attempt"
            className="min-h-56 font-mono text-xs leading-6"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave}>{saveLabel}</Button>
      </div>
    </div>
  )
}

function ApproachComposer({
  draft,
  onChange,
  onCancel,
  onSave,
  saveLabel,
}: {
  draft: ApproachDraft
  onChange: (patch: Partial<ApproachDraft>) => void
  onCancel: () => void
  onSave: () => void
  saveLabel: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--border-default)] bg-[var(--surface-card)] p-5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Input
          value={draft.name}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="Approach name"
        />
        <Input
          value={draft.complexity}
          onChange={(event) => onChange({ complexity: event.target.value })}
          placeholder="Complexity, e.g. O(n log n) / O(n)"
        />
      </div>

      <div className="mt-3 space-y-3">
        <Textarea
          value={draft.summary}
          onChange={(event) => onChange({ summary: event.target.value })}
          placeholder="Short summary of this approach"
          className="min-h-24"
        />
        <Textarea
          value={draft.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
          placeholder="Key notes, tradeoffs, or why you would choose this approach"
          className="min-h-28"
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--text-muted)]">Code</p>
            <p className="text-xs text-[var(--text-muted)]">Optional reference implementation for this approach.</p>
          </div>
          <Textarea
            value={draft.code}
            onChange={(event) => onChange({ code: event.target.value })}
            placeholder="Paste code for this approach"
            className="min-h-56 font-mono text-xs leading-6"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave}>{saveLabel}</Button>
      </div>
    </div>
  )
}

export function ProblemDetailEditor({
  problem,
  relatedProblems,
}: {
  problem: DemoProblemDetail
  relatedProblems: DemoProblemDetail[]
}) {
  const initialAttempts = useMemo<EditableAttempt[]>(
    () => problem.attempts.map((attempt) => ({ ...attempt, code: "" })),
    [problem.attempts],
  )

  const [attempts, setAttempts] = useState(initialAttempts)
  const [attemptDraft, setAttemptDraft] = useState<AttemptDraft>(createAttemptDraft(problem.language))
  const [editingAttemptId, setEditingAttemptId] = useState<number | null>(null)

  const [approaches, setApproaches] = useState<Approach[]>([])
  const [approachDraft, setApproachDraft] = useState<ApproachDraft>(createApproachDraft())
  const [editingApproachId, setEditingApproachId] = useState<number | null>(null)

  function resetAttemptDraft() {
    setAttemptDraft(createAttemptDraft(problem.language))
    setEditingAttemptId(null)
  }

  function resetApproachDraft() {
    setApproachDraft(createApproachDraft())
    setEditingApproachId(null)
  }

  function saveAttempt() {
    const label = attemptDraft.label.trim()
    const insight = attemptDraft.insight.trim()

    if (!label || !insight) return

    const nextAttempt: EditableAttempt = {
      id: editingAttemptId ?? Date.now(),
      label,
      outcome: attemptDraft.outcome,
      date: attemptDraft.date.trim() || "Draft",
      duration: attemptDraft.duration.trim() || "Pending",
      language: attemptDraft.language.trim() || problem.language,
      insight,
      mistakes: attemptDraft.mistakes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      code: attemptDraft.code,
    }

    setAttempts((current) => {
      if (editingAttemptId === null) {
        return [nextAttempt, ...current]
      }

      return current.map((attempt) => (attempt.id === editingAttemptId ? nextAttempt : attempt))
    })

    resetAttemptDraft()
  }

  function startEditingAttempt(attempt: EditableAttempt) {
    setEditingAttemptId(attempt.id)
    setAttemptDraft({
      label: attempt.label,
      outcome: attempt.outcome as AttemptOutcome,
      date: attempt.date,
      duration: attempt.duration,
      language: attempt.language,
      insight: attempt.insight,
      mistakes: attempt.mistakes.join(", "),
      code: attempt.code,
    })
  }

  function saveApproach() {
    const name = approachDraft.name.trim()
    const summary = approachDraft.summary.trim()

    if (!name || !summary) return

    const nextApproach: Approach = {
      id: editingApproachId ?? Date.now(),
      name,
      summary,
      complexity: approachDraft.complexity.trim(),
      notes: approachDraft.notes.trim(),
      code: approachDraft.code,
    }

    setApproaches((current) => {
      if (editingApproachId === null) {
        return [nextApproach, ...current]
      }

      return current.map((approach) => (approach.id === editingApproachId ? nextApproach : approach))
    })

    resetApproachDraft()
  }

  function startEditingApproach(approach: Approach) {
    setEditingApproachId(approach.id)
    setApproachDraft({
      name: approach.name,
      summary: approach.summary,
      complexity: approach.complexity,
      notes: approach.notes,
      code: approach.code,
    })
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="px-0">
        <Link href="/problems">
          <ArrowLeft className="size-4" />
          Back to Problems
        </Link>
      </Button>

      <HeroPanel
        eyebrow={`Problem #${problem.leetcodeId}`}
        title={problem.title}
        description={problem.summary}
        kicker={`${problem.difficulty} · ${problem.status} · ${problem.pattern}`}
        aside={
          <div className="panel h-full p-6">
            <p className="eyebrow">Case-study brief</p>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">{problem.brief}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {problem.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-4">
          <Card className="p-6">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <SectionHeader
                eyebrow="Attempt timeline"
                title="What actually happened on the way to the current status"
                description="Add a new attempt, edit an existing one, and paste the exact code used for that run."
              />
              <Button onClick={() => {
                setEditingAttemptId(null)
                setAttemptDraft(createAttemptDraft(problem.language))
              }}>
                <Plus className="size-4" />
                Add Attempt
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {(editingAttemptId !== null || attempts.length === 0 || attemptDraft.label || attemptDraft.insight || attemptDraft.code) ? (
                <AttemptComposer
                  draft={attemptDraft}
                  onChange={(patch) => setAttemptDraft((current) => ({ ...current, ...patch }))}
                  onCancel={resetAttemptDraft}
                  onSave={saveAttempt}
                  saveLabel={editingAttemptId === null ? "Save Attempt" : "Update Attempt"}
                />
              ) : null}

              {attempts.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-[var(--border-default)] p-5 text-sm text-[var(--text-secondary)]">
                  No attempts yet. Use <span className="text-[var(--text-primary)]">Add Attempt</span> above, then paste the code in the code box inside the editor.
                </div>
              ) : (
                attempts.map((attempt) => (
                  <div key={attempt.id} className="rounded-[1.5rem] border border-[var(--border-default)] bg-[var(--surface-card)] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{attempt.label}</Badge>
                          <Badge variant={attempt.outcome === "Accepted" ? "default" : "outline"}>{attempt.outcome}</Badge>
                          <span className="text-sm text-[var(--text-muted)]">{attempt.date}</span>
                        </div>
                        <p className="mt-3 text-lg font-semibold text-[var(--text-primary)]">{attempt.insight}</p>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                          {attempt.language} · {attempt.duration}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => startEditingAttempt(attempt)}>
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                    </div>
                    {attempt.mistakes.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {attempt.mistakes.map((mistake) => (
                          <Badge key={mistake} variant="outline">{mistake}</Badge>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-4 rounded-[1.2rem] border border-[var(--border-default)] bg-[color:color-mix(in_oklab,var(--surface-muted)_58%,transparent)] p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--text-muted)]">Attempt code</p>
                        <span className="text-xs text-[var(--text-muted)]">
                          {attempt.code.trim() ? "Editable from the attempt editor" : "No code pasted yet"}
                        </span>
                      </div>
                      {attempt.code.trim() ? (
                        <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-[var(--text-secondary)]">
                          {attempt.code}
                        </pre>
                      ) : (
                        <p className="text-sm text-[var(--text-secondary)]">Open edit on this attempt and paste the code into the code field.</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <SectionHeader
                eyebrow="Approaches"
                title="Store multiple ways to solve the same problem"
                description="User-defined names, separate notes, and optional code for brute force, optimal, or any other framing you want."
              />
              <Button onClick={() => {
                setEditingApproachId(null)
                setApproachDraft(createApproachDraft())
              }}>
                <Plus className="size-4" />
                Add Approach
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {(editingApproachId !== null || approaches.length === 0 || approachDraft.name || approachDraft.summary || approachDraft.code) ? (
                <ApproachComposer
                  draft={approachDraft}
                  onChange={(patch) => setApproachDraft((current) => ({ ...current, ...patch }))}
                  onCancel={resetApproachDraft}
                  onSave={saveApproach}
                  saveLabel={editingApproachId === null ? "Save Approach" : "Update Approach"}
                />
              ) : null}

              {approaches.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-[var(--border-default)] p-5 text-sm text-[var(--text-secondary)]">
                  No approaches yet. Add one above and give it any name you want, like <span className="text-[var(--text-primary)]">Brute Force</span> or <span className="text-[var(--text-primary)]">Optimal Window</span>.
                </div>
              ) : (
                approaches.map((approach) => (
                  <div key={approach.id} className="rounded-[1.5rem] border border-[var(--border-default)] bg-[var(--surface-card)] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{approach.name}</Badge>
                          {approach.complexity ? <Badge variant="outline">{approach.complexity}</Badge> : null}
                        </div>
                        <p className="mt-3 text-lg font-semibold text-[var(--text-primary)]">{approach.summary}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => startEditingApproach(approach)}>
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                    </div>
                    {approach.notes ? (
                      <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{approach.notes}</p>
                    ) : null}
                    <div className="mt-4 rounded-[1.2rem] border border-[var(--border-default)] bg-[color:color-mix(in_oklab,var(--surface-muted)_58%,transparent)] p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--text-muted)]">Approach code</p>
                        <span className="text-xs text-[var(--text-muted)]">
                          {approach.code.trim() ? "Saved with this approach" : "No code saved"}
                        </span>
                      </div>
                      {approach.code.trim() ? (
                        <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-[var(--text-secondary)]">
                          {approach.code}
                        </pre>
                      ) : (
                        <p className="text-sm text-[var(--text-secondary)]">Add code in the approach editor if you want a reference implementation here.</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Meta</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                <span>Last touched</span>
                <span className="text-[var(--text-primary)]">{problem.lastTouched}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                <span>Next review</span>
                <span className="text-[var(--text-primary)]">{problem.nextReview}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                <span>Preferred language</span>
                <span className="text-[var(--text-primary)]">{problem.language}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Typical solve time</span>
                <span className="text-[var(--text-primary)]">{problem.timeToSolve}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle>Attached notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {problem.notes.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">No notes attached to this mock problem yet.</p>
              ) : (
                problem.notes.map((note) => (
                  <div key={note.id} className="rounded-[1.3rem] border border-[var(--border-default)] bg-[var(--surface-card)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-[var(--text-primary)]">{note.title}</p>
                      <Badge variant="secondary">{note.tag}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{note.excerpt}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle>Related problems</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {relatedProblems.map((related) => (
                <Link
                  key={related.id}
                  href={`/problems/${related.id}`}
                  className="flex items-center justify-between rounded-[1.3rem] border border-[var(--border-default)] bg-[var(--surface-card)] p-4 transition-colors hover:bg-[var(--surface-accent)]"
                >
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{related.title}</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{related.pattern} · {related.difficulty}</p>
                  </div>
                  <ArrowUpRight className="size-4 text-[var(--text-muted)]" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
