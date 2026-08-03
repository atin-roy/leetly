"use client"

import { useEffect, useRef, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ChevronDown } from "lucide-react"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useLogAttempt, useMistakeOptions, useUpdateAttempt } from "@/hooks/use-attempts"
import { useSettings } from "@/hooks/use-settings"
import { cn } from "@/lib/utils"
import type { AttemptDto, Language, MistakeType } from "@/lib/types"
import styles from "./attempt-form.module.css"

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

const COMPLEXITY_OPTIONS = [
  "O(1)",
  "O(log n)",
  "O(log² n)",
  "O(log³ n)",
  "O(log⁴ n)",
  "O(log k)",
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
  "O(V log V)",
  "O(V log E)",
  "O(V²)",
  "O(V³)",
  "O(n log n)",
  "O(n log k)",
  "O(k log n)",
  "O(n√n)",
  "O(n²)",
  "O(n² log n)",
  "O(n³)",
  "O(n⁴)",
  "O(n⁵)",
  "O(mn)",
  "O(mn log n)",
  "O(m + n log n)",
  "O(m log n)",
  "O(2ⁿ)",
  "O(3ⁿ)",
  "O(kⁿ)",
  "O(n!)",
] as const

const TIME_COMPLEXITY_OPTIONS = COMPLEXITY_OPTIONS

const SPACE_COMPLEXITY_OPTIONS = COMPLEXITY_OPTIONS

const COMPLEXITY_SEARCH_ALIASES: Record<string, string[]> = {
  "O(log² n)": ["O(log^2 n)", "log^2 n"],
  "O(log³ n)": ["O(log^3 n)", "log^3 n"],
  "O(log⁴ n)": ["O(log^4 n)", "log^4 n"],
  "O(V²)": ["O(V^2)", "V^2"],
  "O(V³)": ["O(V^3)", "V^3"],
  "O(n²)": ["O(n^2)", "n^2"],
  "O(n² log n)": ["O(n^2 log n)", "n^2 log n"],
  "O(n³)": ["O(n^3)", "n^3"],
  "O(n⁴)": ["O(n^4)", "n^4"],
  "O(n⁵)": ["O(n^5)", "n^5"],
  "O(2ⁿ)": ["O(2^n)", "2^n"],
  "O(3ⁿ)": ["O(3^n)", "3^n"],
  "O(kⁿ)": ["O(k^n)", "k^n"],
}

const PRIORITY_COMPLEXITY_OPTIONS = new Set([
  "O(1)",
  "O(log n)",
  "O(n)",
  "O(n log n)",
  "O(n²)",
  "O(n³)",
  "O(mn)",
  "O(V + E)",
  "O(E log V)",
  "O(2ⁿ)",
]) as Set<string>

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

function getComplexitySearchText(option: string) {
  return [option, ...(COMPLEXITY_SEARCH_ALIASES[option] ?? [])].join(" ").toLowerCase()
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
  const [query, setQuery] = useState("")

  const prioritizedOptions = [
    ...options.filter((option) => PRIORITY_COMPLEXITY_OPTIONS.has(option)),
    ...options.filter((option) => !PRIORITY_COMPLEXITY_OPTIONS.has(option)),
  ]

  const filteredOptions = prioritizedOptions.filter((option) =>
    getComplexitySearchText(option).includes(query.trim().toLowerCase()),
  )

  return (
    <div className={styles.field}>
      <FormLabel className={styles.fieldLabel}>{label}</FormLabel>

      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) {
            setQuery("")
          }
        }}
      >
        <PopoverTrigger asChild>
          <button type="button" className={styles.complexityTrigger}>
            <span className={value ? styles.complexityValue : styles.complexityPlaceholder}>
              {value || placeholder}
            </span>
            <ChevronDown size={16} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className={styles.complexityPopover}>
          <div>
            <p className={styles.complexityPopoverTitle}>{label}</p>
            <p className={styles.complexityPopoverNote}>{description}</p>
          </div>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search complexity, e.g. O(n^2)"
            className={styles.complexitySearch}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <ScrollArea className={styles.complexityScroll}>
            <div className={styles.complexityGrid}>
              {filteredOptions.map((option) => {
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
                      setQuery("")
                    }}
                    className={styles.complexityOption}
                  >
                    {option}
                  </Button>
                )
              })}
              {filteredOptions.length === 0 ? (
                <p className={styles.complexityEmpty}>No complexity matches that search.</p>
              ) : null}
            </div>
          </ScrollArea>
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
      <DialogContent className={styles.dialog}>
        <DialogHeader className={styles.head}>
          <DialogTitle className={styles.headTitle}>
            {isEdit ? "Edit attempt" : "Log an attempt"}
          </DialogTitle>
          <DialogDescription className={styles.headDescription}>
            Capture the result, then whatever is still worth remembering next time.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.scroll}>
              <div className={styles.scrollInner}>
                <div className={styles.group}>
                  <div className={styles.row}>
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem className={styles.field}>
                          <FormLabel className={styles.fieldLabel}>Language</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
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
                        <FormItem className={styles.field}>
                          <FormLabel className={styles.fieldLabel}>Outcome</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
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
                  </div>

                  <div className={cn(styles.row, styles.rowGap)}>
                    <FormField
                      control={form.control}
                      name="timeComplexity"
                      render={({ field }) => (
                        <FormItem>
                          <ComplexityPicker
                            label="Time complexity"
                            description="Search with n^2, v^2, or pick the closest shorthand."
                            value={field.value ?? ""}
                            options={TIME_COMPLEXITY_OPTIONS}
                            placeholder="Optional"
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
                        <FormItem>
                          <ComplexityPicker
                            label="Space complexity"
                            description="Only add what materially helps future review."
                            value={field.value ?? ""}
                            options={SPACE_COMPLEXITY_OPTIONS}
                            placeholder="Optional"
                            onSelect={field.onChange}
                          />
                          <FormControl>
                            <input type="hidden" value={field.value ?? ""} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className={styles.group}>
                  <p className={styles.groupLabel}>Timer</p>
                  <div className={styles.timerRow}>
                    <div className={styles.timerReadout}>
                      <p className={styles.timerValue}>{formatElapsed(elapsedSeconds)}</p>
                      <p className={styles.timerCaption}>
                        {timerActive ? "Running" : timerStatus === "Captured" ? "Captured" : "Idle"}
                      </p>
                    </div>
                    <div className={styles.timerActions}>
                      <Button type="button" size="sm" onClick={handleStartSolving}>
                        Start
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={handleEndSolving}
                        disabled={!startedAt || Boolean(endedAt)}
                      >
                        Stop
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleResetTimer}
                        disabled={!startedAt && !endedAt}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="durationMinutes"
                    render={({ field }) => (
                      <FormItem className={styles.timerManual}>
                        <FormLabel className={styles.timerManualLabel}>or minutes</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            value={field.value ?? ""}
                            onChange={(e) => handleManualDurationChange(e.target.value, field.onChange)}
                            placeholder="e.g. 18"
                            className={styles.timerManualInput}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {startedAt ? (
                    <p className={styles.fieldHint}>
                      {formatTimestamp(startedAt)} &rarr; {endedAt ? formatTimestamp(endedAt) : "now"}
                    </p>
                  ) : null}
                </div>

                <div className={styles.group}>
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
                          <div className={styles.mistakesHead}>
                            <FormLabel className={styles.fieldLabel}>What went wrong</FormLabel>
                            {selectedMistakes.length > 0 ? (
                              <span className={styles.mistakesCount}>{selectedMistakes.length} selected</span>
                            ) : null}
                          </div>
                          <FormControl>
                            <div>
                              {mistakesLoading ? (
                                <div className={styles.mistakesSkeletonGrid}>
                                  {Array.from({ length: 6 }).map((_, index) => (
                                    <Skeleton key={index} className={styles.mistakesSkeletonPill} />
                                  ))}
                                </div>
                              ) : mistakeOptions?.length ? (
                                <div className={styles.mistakesRow}>
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
                                        className={styles.mistakeChip}
                                      >
                                        {mistake.label || MISTAKE_LABELS[mistake.value]}
                                      </Button>
                                    )
                                  })}
                                </div>
                              ) : (
                                <p className={styles.mistakesEmpty}>No mistake options available.</p>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                </div>

                <div className={styles.group}>
                  <FormField
                    control={form.control}
                    name="approach"
                    render={({ field }) => (
                      <FormItem className={styles.field}>
                        <FormLabel className={styles.fieldLabel}>Approach</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Binary search on answer, then validate with a greedy pass."
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
                      <FormItem className={styles.field}>
                        <FormLabel className={styles.fieldLabel}>Code snapshot</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            placeholder="if (freq.get(char) > 1) { left++; }"
                            rows={3}
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

                <div className={styles.group}>
                  <FormField
                    control={form.control}
                    name="learned"
                    render={({ field }) => (
                      <FormItem className={styles.field}>
                        <FormLabel className={styles.fieldLabel}>Key insight</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="The invariant mattered more than the final loop structure."
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
                      <FormItem className={styles.field}>
                        <FormLabel className={styles.fieldLabel}>Pattern to remember</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="If the answer is monotonic, test binary search on the answer."
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
                      <FormItem className={styles.field}>
                        <FormLabel className={styles.fieldLabel}>Anything else</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Retry once without looking at the editorial."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className={styles.footer}>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={logMutation.isPending || updateMutation.isPending}>
                {isEdit ? "Save changes" : "Log attempt"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
