"use client"

import { useEffect, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useLogAttempt, useUpdateAttempt } from "@/hooks/use-attempts"
import { useSettings } from "@/hooks/use-settings"
import type { AttemptDto, Language } from "@/lib/types"

const LANGUAGES = [
  "JAVA", "PYTHON", "JAVASCRIPT", "TYPESCRIPT",
  "CPP", "C", "GO", "RUST", "KOTLIN", "SWIFT",
] as const

const OUTCOMES = [
  { value: "ACCEPTED", label: "Accepted" },
  { value: "WRONG_ANSWER", label: "Wrong Answer" },
  { value: "TIME_LIMIT_EXCEEDED", label: "TLE" },
  { value: "MEMORY_LIMIT_EXCEEDED", label: "MLE" },
  { value: "RUNTIME_ERROR", label: "Runtime Error" },
  { value: "NOT_COMPLETED", label: "Not Completed" },
] as const

const TIME_COMPLEXITIES = [
  "O(1)",
  "O(n)",
  "O(log n)",
  "O(n log n)",
  "O(n^2)",
  "O(m + n)",
  "O(V + E)",
  "O(sqrt n)",
  "O(log^2 n)",
  "O(n + k)",
  "O(nk)",
  "O(mn)",
  "O(n^3)",
  "O(2^n)",
  "O(n!)",
  "O(k^n)",
] as const

const SPACE_COMPLEXITIES = [
  "O(1)",
  "O(n)",
  "O(log n)",
  "O(m + n)",
  "O(V + E)",
  "O(sqrt n)",
  "O(n log n)",
  "O(n^2)",
  "O(nk)",
  "O(mn)",
  "O(n^3)",
] as const

const schema = z.object({
  language: z.enum(LANGUAGES),
  outcome: z.enum(["ACCEPTED", "WRONG_ANSWER", "TIME_LIMIT_EXCEEDED", "MEMORY_LIMIT_EXCEEDED", "RUNTIME_ERROR", "NOT_COMPLETED"]),
  code: z.string().optional(),
  approach: z.string().optional(),
  durationMinutes: z.number().int().min(0).optional(),
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
    return `${hours}h ${minutes}m ${seconds}s`
  }

  return `${minutes}m ${seconds}s`
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
  return parsed ? format(parsed, "MMM d, yyyy h:mm:ss a") : "Not set"
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
  const logMutation = useLogAttempt(problemId)
  const updateMutation = useUpdateAttempt(problemId)
  const [nowMs, setNowMs] = useState(() => Date.now())

  const preferredLanguage = settings?.preferredLanguage
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(normalizeLanguage(preferredLanguage), attempt),
  })

  const startedAt = useWatch({ control: form.control, name: "startedAt" })
  const endedAt = useWatch({ control: form.control, name: "endedAt" })
  const elapsedSeconds = getElapsedSeconds(startedAt, endedAt, nowMs)

  useEffect(() => {
    if (!open) return
    form.reset(getDefaultValues(normalizeLanguage(preferredLanguage), attempt))
  }, [attempt, form, open, preferredLanguage])

  useEffect(() => {
    if (!open || attempt || !preferredLanguage) return
    if (form.getFieldState("language").isDirty) return
    form.setValue("language", normalizeLanguage(preferredLanguage), { shouldDirty: false })
  }, [attempt, form, open, preferredLanguage])

  useEffect(() => {
    if (!open || !startedAt || endedAt) return

    const interval = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [endedAt, open, startedAt])

  function handleStartSolving() {
    const started = createLocalTimestamp()
    form.setValue("startedAt", started, { shouldDirty: true })
    form.setValue("endedAt", undefined, { shouldDirty: true })
  }

  function handleEndSolving() {
    if (!form.getValues("startedAt")) {
      handleStartSolving()
    }

    form.setValue("endedAt", createLocalTimestamp(), { shouldDirty: true })
  }

  function handleResetTimer() {
    form.setValue("startedAt", undefined, { shouldDirty: true })
    form.setValue("endedAt", undefined, { shouldDirty: true })
  }

  async function onSubmit(values: FormValues) {
    const body = {
      language: values.language,
      outcome: values.outcome,
      code: normalizeText(values.code),
      approach: normalizeText(values.approach),
      durationMinutes: values.durationMinutes,
      timeComplexity: values.timeComplexity || undefined,
      spaceComplexity: values.spaceComplexity || undefined,
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
      <DialogContent className="flex h-[88vh] max-h-[88vh] max-w-[96vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>{isEdit ? "Edit Attempt" : "Log Attempt"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="grid shrink-0 gap-4 border-b px-6 py-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_1.5fr]">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGES.map((language) => (
                          <SelectItem key={language} value={language}>{language}</SelectItem>
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
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {OUTCOMES.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
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
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time complexity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIME_COMPLEXITIES.map((complexity) => (
                          <SelectItem key={complexity} value={complexity}>{complexity}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select space complexity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SPACE_COMPLEXITIES.map((complexity) => (
                          <SelectItem key={complexity} value={complexity}>{complexity}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-lg border bg-muted/20 px-4 py-3">
                <p className="text-sm font-medium">Solve Timer</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{formatElapsed(elapsedSeconds)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Recorded automatically when both start and end are set.</p>
                <div className="mt-3 flex flex-wrap gap-2">
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
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p>Started: {formatTimestamp(startedAt)}</p>
                  <p>Ended: {formatTimestamp(endedAt)}</p>
                </div>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 overflow-hidden divide-y lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)] lg:divide-x lg:divide-y-0">
              <div className="flex min-h-0 flex-col gap-4 p-6">
                <FormField
                  control={form.control}
                  name="approach"
                  render={({ field }) => (
                    <FormItem className="flex min-h-0 flex-col">
                      <FormLabel>Approach</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Capture your brainstorming, edge cases, tradeoffs, and intended algorithm before or during the solve."
                          className="min-h-32 resize-none"
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
                    <FormItem className="flex min-h-0 flex-1 flex-col">
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Paste your solution here..."
                          className="min-h-0 h-full flex-1 resize-none font-mono text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex min-h-0 flex-col gap-4 p-6">
                <FormField
                  control={form.control}
                  name="learned"
                  render={({ field }) => (
                    <FormItem className="flex min-h-0 flex-1 flex-col">
                      <FormLabel>What I learned</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Key insights..."
                          className="min-h-0 h-full flex-1 resize-none"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="takeaways"
                  render={({ field }) => (
                    <FormItem className="flex min-h-0 flex-1 flex-col">
                      <FormLabel>Takeaways</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Patterns to remember..."
                          className="min-h-0 h-full flex-1 resize-none"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="flex min-h-0 flex-1 flex-col">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Additional notes..."
                          className="min-h-0 h-full flex-1 resize-none"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t px-6 py-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={logMutation.isPending || updateMutation.isPending}>
                {isEdit ? "Update" : "Log Attempt"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
