"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useLogAttempt, useMistakeOptions, useUpdateAttempt } from "@/hooks/use-attempts"
import { useSettings } from "@/hooks/use-settings"
import type { AttemptDto, Language, MistakeType } from "@/lib/types"

const LANGUAGES = [
  "JAVA",
  "PYTHON",
  "JAVASCRIPT",
  "TYPESCRIPT",
  "CPP",
  "C",
  "GO",
  "RUST",
  "KOTLIN",
  "SWIFT",
] as const

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "JAVA", label: "Java" },
  { value: "PYTHON", label: "Python" },
  { value: "JAVASCRIPT", label: "JavaScript" },
  { value: "TYPESCRIPT", label: "TypeScript" },
  { value: "CPP", label: "C++" },
  { value: "C", label: "C" },
  { value: "GO", label: "Go" },
  { value: "RUST", label: "Rust" },
  { value: "KOTLIN", label: "Kotlin" },
  { value: "SWIFT", label: "Swift" },
]

const OUTCOMES = [
  { value: "ACCEPTED", label: "Accepted" },
  { value: "WRONG_ANSWER", label: "Wrong Answer" },
  { value: "TIME_LIMIT_EXCEEDED", label: "TLE" },
  { value: "MEMORY_LIMIT_EXCEEDED", label: "MLE" },
  { value: "RUNTIME_ERROR", label: "Runtime Error" },
  { value: "NOT_COMPLETED", label: "Not Completed" },
] as const

const TIME_COMPLEXITY_OPTIONS = [
  "O(1)",
  "O(log n)",
  "O(log² n)",
  "O(√n)",
  "O(∛n)",
  "O(α(n))",
  "O(k)",
  "O(d)",
  "O(h)",
  "O(w)",
  "O(n)",
  "O(m)",
  "O(n + m)",
  "O(m + k)",
  "O(n + k)",
  "O(V)",
  "O(E)",
  "O(V + E)",
  "O(E log V)",
  "O(V²)",
  "O(n log n)",
  "O(n log k)",
  "O(k log n)",
  "O(n√n)",
  "O(n²)",
  "O(n² log n)",
  "O(n³)",
  "O(mn)",
  "O(mn log n)",
  "O(2ⁿ)",
  "O(3ⁿ)",
  "O(kⁿ)",
  "O(n!)",
] as const

const SPACE_COMPLEXITY_OPTIONS = [
  "O(1)",
  "O(log n)",
  "O(log² n)",
  "O(√n)",
  "O(k)",
  "O(d)",
  "O(h)",
  "O(w)",
  "O(n)",
  "O(m)",
  "O(n + m)",
  "O(V)",
  "O(E)",
  "O(V + E)",
  "O(n log n)",
  "O(n²)",
  "O(mn)",
] as const

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

const schema = z.object({
  language: z.enum(LANGUAGES),
  outcome: z.enum([
    "ACCEPTED",
    "WRONG_ANSWER",
    "TIME_LIMIT_EXCEEDED",
    "MEMORY_LIMIT_EXCEEDED",
    "RUNTIME_ERROR",
    "NOT_COMPLETED",
  ]),
  code: z.string().optional(),
  approach: z.string().optional(),
  durationMinutes: z.number().int().min(0).optional(),
  mistakes: z.array(z.string()),
  timeComplexity: z.string().optional(),
  spaceComplexity: z.string().optional(),
  learned: z.string().optional(),
  takeaways: z.string().optional(),
  notes: z.string().optional(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  problemId: number
  attempt?: AttemptDto
}

function getDefaultValues(preferredLanguage?: Language, attempt?: AttemptDto): FormValues {
  if (attempt) {
    return {
      language: attempt.language,
      outcome: attempt.outcome,
      code: attempt.code ?? "",
      approach: attempt.approach ?? "",
      durationMinutes: attempt.durationMinutes ?? undefined,
      mistakes: attempt.mistakes ?? [],
      timeComplexity: attempt.timeComplexity ?? undefined,
      spaceComplexity: attempt.spaceComplexity ?? undefined,
      learned: attempt.learned ?? "",
      takeaways: attempt.takeaways ?? "",
      notes: attempt.notes ?? "",
      startedAt: attempt.startedAt ?? undefined,
      endedAt: attempt.endedAt ?? undefined,
    }
  }

  return {
    language: preferredLanguage ?? "PYTHON",
    outcome: "NOT_COMPLETED",
    code: "",
    approach: "",
    durationMinutes: undefined,
    mistakes: [],
    timeComplexity: undefined,
    spaceComplexity: undefined,
    learned: "",
    takeaways: "",
    notes: "",
    startedAt: undefined,
    endedAt: undefined,
  }
}

function normalizeLanguage(preferredLanguage?: Language | null): Language {
  return preferredLanguage && LANGUAGES.includes(preferredLanguage)
    ? preferredLanguage
    : "PYTHON"
}

function formatElapsed(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
  }

  return `${minutes}m ${String(seconds).padStart(2, "0")}s`
}

function parseLocalTimestamp(value?: string) {
  if (!value) return undefined

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  )

  if (match) {
    const [, year, month, day, hour, minute, second = "0"] = match
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    )
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function getElapsedSeconds(startedAt?: string, endedAt?: string, nowMs?: number) {
  if (!startedAt) return 0

  const startMs = parseLocalTimestamp(startedAt)?.getTime() ?? Number.NaN
  const endMs = endedAt
    ? (parseLocalTimestamp(endedAt)?.getTime() ?? Number.NaN)
    : nowMs ?? Date.now()

  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) return 0
  return Math.floor((endMs - startMs) / 1000)
}

function formatTimestamp(value?: string) {
  if (!value) return "Not set"
  const parsed = parseLocalTimestamp(value)
  return parsed ? format(parsed, "MMM d, yyyy • h:mm:ss a") : "Not set"
}

function createLocalTimestamp() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

function normalizeText(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function AttemptForm({ open, onOpenChange, problemId, attempt }: Props) {
  const isEdit = !!attempt
  const { data: settings } = useSettings()
  const { data: mistakeOptions, isLoading: mistakesLoading } = useMistakeOptions()
  const logMutation = useLogAttempt(problemId)
  const updateMutation = useUpdateAttempt(problemId)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const wasOpenRef = useRef(false)
  const preferredLanguage = settings?.preferredLanguage
  const timeComplexityListId = `${useId().replace(/:/g, "")}-time-complexities`
  const spaceComplexityListId = `${useId().replace(/:/g, "")}-space-complexities`

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(normalizeLanguage(preferredLanguage), attempt),
  })

  const startedAt = useWatch({ control: form.control, name: "startedAt" })
  const endedAt = useWatch({ control: form.control, name: "endedAt" })
  const elapsedSeconds = getElapsedSeconds(startedAt, endedAt, nowMs)
  const timerActive = Boolean(startedAt && !endedAt)

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      form.reset(getDefaultValues(normalizeLanguage(preferredLanguage), attempt))
    }

    wasOpenRef.current = open
  }, [attempt, form, open, preferredLanguage])

  useEffect(() => {
    if (!open || attempt || !preferredLanguage) return
    if (form.getFieldState("language").isDirty) return

    const currentLanguage = form.getValues("language")
    if (!currentLanguage || currentLanguage === "PYTHON") {
      form.setValue("language", normalizeLanguage(preferredLanguage), { shouldDirty: false })
    }
  }, [attempt, form, open, preferredLanguage])

  useEffect(() => {
    if (!open || !startedAt || endedAt) return

    const interval = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [endedAt, open, startedAt])

  function handleStartSolving() {
    const started = createLocalTimestamp()
    setNowMs(Date.now())
    form.setValue("startedAt", started, { shouldDirty: true })
    form.setValue("endedAt", undefined, { shouldDirty: true })
  }

  function handleEndSolving() {
    const startValue = form.getValues("startedAt")

    if (!startValue) {
      const started = createLocalTimestamp()
      form.setValue("startedAt", started, { shouldDirty: true })
    }

    form.setValue("endedAt", createLocalTimestamp(), { shouldDirty: true })
    setNowMs(Date.now())
  }

  function handleResetTimer() {
    form.setValue("startedAt", undefined, { shouldDirty: true })
    form.setValue("endedAt", undefined, { shouldDirty: true })
    setNowMs(Date.now())
  }

  function handleManualDurationChange(rawValue: string, onChange: (value?: number) => void) {
    if (rawValue === "") {
      onChange(undefined)
      return
    }

    const nextValue = Number(rawValue)
    if (!Number.isFinite(nextValue)) return

    form.setValue("startedAt", undefined, { shouldDirty: true })
    form.setValue("endedAt", undefined, { shouldDirty: true })
    onChange(Math.max(0, Math.trunc(nextValue)))
  }

  async function onSubmit(values: FormValues) {
    const body = {
      language: values.language,
      outcome: values.outcome,
      code: normalizeText(values.code),
      approach: normalizeText(values.approach),
      durationMinutes: values.durationMinutes,
      mistakes: values.mistakes as MistakeType[],
      timeComplexity: normalizeText(values.timeComplexity),
      spaceComplexity: normalizeText(values.spaceComplexity),
      learned: normalizeText(values.learned),
      takeaways: normalizeText(values.takeaways),
      notes: normalizeText(values.notes),
      startedAt: values.startedAt,
      endedAt: values.endedAt,
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ attemptId: attempt.id, body })
        toast.success("Attempt updated")
      } else {
        await logMutation.mutateAsync(body)
        toast.success("Attempt logged")
      }

      onOpenChange(false)
    } catch {
      toast.error(isEdit ? "Failed to update attempt" : "Failed to log attempt")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[88vh] w-[96vw] max-w-[1120px] flex-col gap-0 overflow-hidden rounded-[28px] border border-border/70 bg-background p-0 shadow-2xl sm:max-w-[1120px]">
        <DialogHeader className="border-b border-border/70 bg-card/95 px-6 py-5">
          <DialogTitle className="text-xl">{isEdit ? "Edit Attempt" : "Log Attempt"}</DialogTitle>
          <DialogDescription className="pt-1">
            A cleaner post-solve snapshot: outcome, timing, complexity, mistakes, and what to carry forward.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-background to-muted/10">
              <div className="space-y-4 px-6 py-6">
                <section className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_360px]">
                  <div className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
                    <div className="mb-4">
                      <div>
                        <p className="text-sm font-semibold">Attempt Summary</p>
                        <p className="text-xs text-muted-foreground">
                          Keep the top-level details compact and legible.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {LANGUAGE_OPTIONS.map((language) => (
                                  <SelectItem key={language.value} value={language.value}>
                                    {language.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="outcome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Outcome</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {OUTCOMES.map((outcome) => (
                                  <SelectItem key={outcome.value} value={outcome.value}>
                                    {outcome.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="timeComplexity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Complexity</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                list={timeComplexityListId}
                                placeholder="e.g. O(n log n), O(d)"
                                className="bg-background font-mono"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="spaceComplexity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Space Complexity</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                list={spaceComplexityListId}
                                placeholder="e.g. O(h), O(V + E)"
                                className="bg-background font-mono"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">Solve Timer</p>
                        <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight">
                          {formatElapsed(elapsedSeconds)}
                        </p>
                      </div>
                      <div className="rounded-full border border-border/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        {timerActive ? "Live" : startedAt && endedAt ? "Captured" : "Idle"}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button type="button" size="sm" onClick={handleStartSolving}>
                        Start solving
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={handleEndSolving}>
                        End
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={handleResetTimer}>
                        Reset
                      </Button>
                    </div>

                    <div className="mt-4 grid gap-3">
                      <FormField
                        control={form.control}
                        name="durationMinutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Manual Time (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step={1}
                                value={field.value ?? ""}
                                onChange={(e) => handleManualDurationChange(e.target.value, field.onChange)}
                                placeholder="Enter minutes manually"
                                className="bg-background"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-2 text-xs text-muted-foreground">
                        <div className="rounded-xl border border-border/70 bg-muted/35 px-3 py-2">
                          Started: {formatTimestamp(startedAt)}
                        </div>
                        <div className="rounded-xl border border-border/70 bg-muted/35 px-3 py-2">
                          Ended: {formatTimestamp(endedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                  <div className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">Implementation Snapshot</p>
                        <p className="text-xs text-muted-foreground">
                          Keep the important context concise instead of sprawling.
                        </p>
                      </div>
                      <div className="rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        Inputs Only
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name="approach"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Approach</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                placeholder="High-level strategy, tradeoffs, edge cases"
                                className="h-11 bg-background"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                placeholder="Paste a compact code snapshot or key line"
                                className="h-11 bg-background font-mono text-sm"
                                autoCapitalize="off"
                                autoCorrect="off"
                                spellCheck={false}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
                    <div className="mb-4">
                      <p className="text-sm font-semibold">Retrospective</p>
                      <p className="text-xs text-muted-foreground">
                        Capture mistakes, lessons, and future reminders without wasted space.
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="mistakes"
                      render={({ field }) => {
                        const selectedMistakes = field.value ?? []

                        function toggleMistake(mistake: string) {
                          const nextValue = selectedMistakes.includes(mistake)
                            ? selectedMistakes.filter((value) => value !== mistake)
                            : [...selectedMistakes, mistake]
                          field.onChange(nextValue)
                        }

                        return (
                          <FormItem>
                            <FormLabel>Mistakes</FormLabel>
                            <FormControl>
                              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                                {mistakesLoading ? (
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    {Array.from({ length: 8 }).map((_, index) => (
                                      <Skeleton key={index} className="h-9 w-full rounded-full" />
                                    ))}
                                  </div>
                                ) : mistakeOptions?.length ? (
                                  <div className="flex flex-wrap gap-2">
                                    {mistakeOptions.map((mistake) => {
                                      const active = selectedMistakes.includes(mistake.value)
                                      return (
                                        <Button
                                          key={mistake.value}
                                          type="button"
                                          size="sm"
                                          variant={active ? "default" : "outline"}
                                          onClick={() => toggleMistake(mistake.value)}
                                          className="rounded-full"
                                        >
                                          {mistake.label || MISTAKE_LABELS[mistake.value]}
                                        </Button>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No mistake options available.</p>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />

                    <div className="mt-4 grid gap-4">
                      <FormField
                        control={form.control}
                        name="learned"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What I Learned</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                placeholder="Key insight from this attempt"
                                className="h-11 bg-background"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="takeaways"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Takeaways</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                placeholder="Pattern or rule to remember"
                                className="h-11 bg-background"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                placeholder="Anything else worth keeping"
                                className="h-11 bg-background"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <datalist id={timeComplexityListId}>
              {TIME_COMPLEXITY_OPTIONS.map((complexity) => (
                <option key={complexity} value={complexity} />
              ))}
            </datalist>

            <datalist id={spaceComplexityListId}>
              {SPACE_COMPLEXITY_OPTIONS.map((complexity) => (
                <option key={complexity} value={complexity} />
              ))}
            </datalist>

            <div className="flex shrink-0 items-center justify-between border-t border-border/70 bg-card/95 px-6 py-4">
              <p className="text-xs text-muted-foreground">
                Manual time clears timer stamps. Timer stamps override manual time when both are set.
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={logMutation.isPending || updateMutation.isPending}>
                  {isEdit ? "Update Attempt" : "Log Attempt"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
