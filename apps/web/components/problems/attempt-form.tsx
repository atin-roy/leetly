"use client"

import { useEffect, useRef, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ChevronDown } from "lucide-react"
import { z } from "zod"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

function getTimerStatus(startedAt?: string, endedAt?: string) {
  if (startedAt && !endedAt) return "Live"
  if (startedAt && endedAt) return "Captured"
  return "Idle"
}

function ComplexityPicker({
  label,
  description,
  value,
  options,
  placeholder,
  onSelect,
}: {
  label: string
  description: string
  value?: string
  options: readonly string[]
  placeholder: string
  onSelect: (value: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="grid gap-2">
      <div className="space-y-1">
        <FormLabel className="text-sm font-semibold">{label}</FormLabel>
        <FormDescription>{description}</FormDescription>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-left font-mono text-sm shadow-sm outline-none transition-all hover:border-primary/35 focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <span className={value ? "text-foreground" : "text-muted-foreground"}>
              {value || placeholder}
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(32rem,calc(100vw-4rem))] rounded-2xl border-border/70 bg-background/98 p-4"
        >
          <div className="mb-3 space-y-1">
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-sm text-muted-foreground">
              Pick the closest shorthand instead of typing a long expression list.
            </p>
          </div>
          <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
            {options.map((option) => {
              const active = value === option
              return (
                <Button
                  key={option}
                  type="button"
                  variant={active ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    onSelect(option)
                    setOpen(false)
                  }}
                  className="h-10 justify-center rounded-xl px-3 font-mono text-xs"
                >
                  {option}
                </Button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
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

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(normalizeLanguage(preferredLanguage), attempt),
  })

  const startedAt = useWatch({ control: form.control, name: "startedAt" })
  const endedAt = useWatch({ control: form.control, name: "endedAt" })
  const elapsedSeconds = getElapsedSeconds(startedAt, endedAt, nowMs)
  const timerActive = Boolean(startedAt && !endedAt)
  const timerStatus = getTimerStatus(startedAt, endedAt)

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
      <DialogContent className="flex h-[92vh] w-[96vw] max-w-[1180px] flex-col gap-0 overflow-hidden rounded-[32px] border border-border/70 bg-background p-0 shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:max-w-[1180px] [&>[data-slot=dialog-close]]:top-6 [&>[data-slot=dialog-close]]:right-6 [&>[data-slot=dialog-close]]:rounded-full [&>[data-slot=dialog-close]]:border [&>[data-slot=dialog-close]]:border-border/70 [&>[data-slot=dialog-close]]:bg-background/95 [&>[data-slot=dialog-close]]:p-2 [&>[data-slot=dialog-close]]:text-foreground/70 [&>[data-slot=dialog-close]]:shadow-sm">
        <DialogHeader className="border-b border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_92%,white_8%),var(--background))] px-6 py-6 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                  Attempt Log
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                  {isEdit ? "Editing Existing Entry" : "New Solve Reflection"}
                </Badge>
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-2xl font-semibold tracking-tight sm:text-[2rem]">
                  {isEdit ? "Refine your attempt" : "Capture the attempt while it is still fresh"}
                </DialogTitle>
                <DialogDescription className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
                  Record the core outcome first, then add timing, implementation notes, and the one or two lessons worth keeping.
                </DialogDescription>
              </div>
            </div>

            <div className="grid min-w-[220px] gap-2 rounded-2xl border border-border/70 bg-background/90 px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Suggested order
              </p>
              <p className="text-sm text-foreground">Summary, timer, implementation notes, then retrospective.</p>
            </div>
          </div>
        </DialogHeader>

        <div className="border-b border-border/70 bg-muted/20 px-6 py-3 text-sm text-muted-foreground sm:px-8">
          Optional fields can stay blank. If you use both timer stamps and manual time, captured timestamps take priority.
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-6 sm:px-8 sm:py-8">
                <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_320px]">
                  <div className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-sm">
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Step 1
                        </p>
                        <div className="space-y-1">
                          <h2 className="text-lg font-semibold tracking-tight">Core attempt details</h2>
                          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                            Start with the facts you will want later: language, result, and rough complexity.
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                        Primary details
                      </Badge>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem className="rounded-2xl border border-border/70 bg-background/80 p-4">
                            <FormLabel className="text-sm font-semibold">Language</FormLabel>
                            <FormDescription>Which language you used for the solve.</FormDescription>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 bg-background">
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
                          <FormItem className="rounded-2xl border border-border/70 bg-background/80 p-4">
                            <FormLabel className="text-sm font-semibold">Outcome</FormLabel>
                            <FormDescription>How the attempt finished.</FormDescription>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 bg-background">
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
                          <FormItem className="rounded-2xl border border-border/70 bg-background/80 p-4">
                            <ComplexityPicker
                              label="Time complexity"
                              description="Use a shorthand estimate if exact analysis is not the point."
                              value={field.value ?? ""}
                              options={TIME_COMPLEXITY_OPTIONS}
                              placeholder="Choose a time complexity"
                              onSelect={field.onChange}
                            />
                            <FormControl>
                              <input type="hidden" value={field.value ?? ""} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="spaceComplexity"
                        render={({ field }) => (
                          <FormItem className="rounded-2xl border border-border/70 bg-background/80 p-4">
                            <ComplexityPicker
                              label="Space complexity"
                              description="Only add what materially helps future review."
                              value={field.value ?? ""}
                              options={SPACE_COMPLEXITY_OPTIONS}
                              placeholder="Choose a space complexity"
                              onSelect={field.onChange}
                            />
                            <FormControl>
                              <input type="hidden" value={field.value ?? ""} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                            <FormItem className="rounded-2xl border border-border/70 bg-background/80 p-4 md:col-span-2">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <FormLabel className="text-sm font-semibold">Mistakes that mattered</FormLabel>
                                  <FormDescription>
                                    Tag the mistakes that explain the result so the top section carries the important context.
                                  </FormDescription>
                                </div>
                                <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                                  {selectedMistakes.length} selected
                                </Badge>
                              </div>
                              <FormControl>
                                <div className="mt-2 rounded-2xl border border-dashed border-border/80 bg-muted/15 p-3">
                                  {mistakesLoading ? (
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                      {Array.from({ length: 8 }).map((_, index) => (
                                        <Skeleton key={index} className="h-10 w-full rounded-full" />
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
                                            aria-pressed={active}
                                            onClick={() => toggleMistake(mistake.value)}
                                            className="min-h-9 rounded-full px-4 text-xs"
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
                    </div>
                  </div>

                  <aside className="rounded-3xl border border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--card)_86%,white_14%),var(--card))] p-6 shadow-sm">
                    <div className="space-y-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Step 2
                            </p>
                            <h2 className="mt-1 text-lg font-semibold tracking-tight">Solve timer</h2>
                          </div>
                          <Badge
                            variant={timerStatus === "Live" ? "default" : "outline"}
                            className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]"
                          >
                            {timerStatus}
                          </Badge>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Use the live timer or enter a manual duration if you only need a rough number.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-background/90 p-5">
                        <p className="text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
                          {formatElapsed(elapsedSeconds)}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {timerActive
                            ? "Timer is running now."
                            : startedAt && endedAt
                              ? "Captured from recorded start and end times."
                              : "No live timer running yet."}
                        </p>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                        <Button type="button" className="h-11" onClick={handleStartSolving}>
                          Start timer
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-11"
                          onClick={handleEndSolving}
                          disabled={!startedAt || Boolean(endedAt)}
                        >
                          Stop timer
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11"
                          onClick={handleResetTimer}
                          disabled={!startedAt && !endedAt}
                        >
                          Clear timer
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name="durationMinutes"
                        render={({ field }) => (
                          <FormItem className="rounded-2xl border border-border/70 bg-background/80 p-4">
                            <FormLabel className="text-sm font-semibold">Manual duration</FormLabel>
                            <FormDescription>Entering minutes clears existing start and end timestamps.</FormDescription>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step={1}
                                value={field.value ?? ""}
                                onChange={(e) => handleManualDurationChange(e.target.value, field.onChange)}
                                placeholder="Minutes spent"
                                className="h-11 bg-background"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-3">
                        <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Started
                          </p>
                          <p className="mt-2 text-sm text-foreground">{formatTimestamp(startedAt)}</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Ended
                          </p>
                          <p className="mt-2 text-sm text-foreground">{formatTimestamp(endedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </aside>
                </section>

                <section className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-sm">
                  <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Step 3
                      </p>
                      <div className="space-y-1">
                        <h2 className="text-lg font-semibold tracking-tight">Implementation snapshot</h2>
                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                          Keep this concise. Capture the strategy you took and the smallest useful code snippet or fragment.
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                      Concise notes
                    </Badge>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <FormField
                      control={form.control}
                      name="approach"
                      render={({ field }) => (
                        <FormItem className="rounded-2xl border border-border/70 bg-background/80 p-4">
                          <FormLabel className="text-sm font-semibold">Approach</FormLabel>
                          <FormDescription>
                            High-level strategy, tradeoffs, edge cases, or where the plan broke down.
                          </FormDescription>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="Binary search on answer, then validate with a greedy pass."
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
                        <FormItem className="rounded-2xl border border-border/70 bg-background/80 p-4">
                          <FormLabel className="text-sm font-semibold">Code snapshot</FormLabel>
                          <FormDescription>
                            Paste only the most useful excerpt, not the entire submission.
                          </FormDescription>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="if (freq.get(char) > 1) { left++; }"
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
                </section>

                <section className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-sm">
                  <div className="mb-6 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Step 4
                    </p>
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold tracking-tight">Retrospective</h2>
                      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                        Select the mistakes that actually mattered, then keep the written takeaways short enough to reread later.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    <div className="grid gap-5 md:col-span-2 xl:col-span-3 xl:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="learned"
                        render={({ field }) => (
                          <FormItem className="rounded-2xl border border-border/70 bg-background/80 p-4">
                          <FormLabel className="text-sm font-semibold">Key insight</FormLabel>
                          <FormDescription>The single lesson most worth revisiting.</FormDescription>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="The invariant mattered more than the final loop structure."
                              className="h-11 bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                      <FormField
                        control={form.control}
                        name="takeaways"
                        render={({ field }) => (
                          <FormItem className="rounded-2xl border border-border/70 bg-background/80 p-4">
                          <FormLabel className="text-sm font-semibold">Pattern to remember</FormLabel>
                          <FormDescription>A reusable rule, trigger, or heuristic for next time.</FormDescription>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="If the answer is monotonic, test binary search on the answer."
                              className="h-11 bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem className="rounded-2xl border border-border/70 bg-background/80 p-4">
                          <FormLabel className="text-sm font-semibold">Anything worth preserving</FormLabel>
                          <FormDescription>Small follow-ups, reminders, or context that does not fit above.</FormDescription>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="Retry once without looking at the editorial."
                              className="h-11 bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-4 border-t border-border/70 bg-card/95 px-6 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Review for signal, not completeness.</p>
                <p className="text-sm text-muted-foreground">
                  The best attempt logs stay compact enough to scan quickly before a future retry.
                </p>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button type="button" variant="outline" className="h-11 min-w-28" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-11 min-w-36"
                  disabled={logMutation.isPending || updateMutation.isPending}
                >
                  {isEdit ? "Save Changes" : "Log Attempt"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
