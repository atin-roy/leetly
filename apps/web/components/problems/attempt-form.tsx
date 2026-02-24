"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useLogAttempt, useUpdateAttempt } from "@/hooks/use-attempts"
import type { AttemptDto } from "@/lib/types"

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

const schema = z.object({
  language: z.enum(LANGUAGES),
  outcome: z.enum(["ACCEPTED","WRONG_ANSWER","TIME_LIMIT_EXCEEDED","MEMORY_LIMIT_EXCEEDED","RUNTIME_ERROR","NOT_COMPLETED"]),
  code: z.string().min(1, "Code is required"),
  durationMinutes: z.number().int().positive().optional(),
  timeComplexity: z.string().optional(),
  spaceComplexity: z.string().optional(),
  learned: z.string().optional(),
  takeaways: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  problemId: number
  attempt?: AttemptDto
}

export function AttemptForm({ open, onOpenChange, problemId, attempt }: Props) {
  const isEdit = !!attempt
  const logMutation = useLogAttempt(problemId)
  const updateMutation = useUpdateAttempt(problemId)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      language: "PYTHON",
      outcome: "NOT_COMPLETED",
      code: "",
      durationMinutes: undefined,
      timeComplexity: "",
      spaceComplexity: "",
      learned: "",
      takeaways: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (attempt) {
      form.reset({
        language: attempt.language,
        outcome: attempt.outcome,
        code: attempt.code,
        durationMinutes: attempt.durationMinutes ?? undefined,
        timeComplexity: attempt.timeComplexity ?? "",
        spaceComplexity: attempt.spaceComplexity ?? "",
        learned: attempt.learned ?? "",
        takeaways: attempt.takeaways ?? "",
        notes: attempt.notes ?? "",
      })
    } else {
      form.reset()
    }
  }, [attempt, form])

  async function onSubmit(values: FormValues) {
    const body = {
      language: values.language,
      outcome: values.outcome,
      code: values.code,
      durationMinutes: values.durationMinutes,
      timeComplexity: values.timeComplexity || undefined,
      spaceComplexity: values.spaceComplexity || undefined,
      learned: values.learned || undefined,
      takeaways: values.takeaways || undefined,
      notes: values.notes || undefined,
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ attemptId: attempt!.id, body })
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
      <DialogContent className="sm:max-w-5xl h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="shrink-0 px-6 py-5 border-b">
          <DialogTitle>{isEdit ? "Edit Attempt" : "Log Attempt"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Top bar: Language + Outcome + Duration + Time + Space */}
            <div className="shrink-0 grid grid-cols-5 gap-4 px-6 py-4 border-b">
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
                        {LANGUAGES.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
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
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeComplexity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="O(n)" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="spaceComplexity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Space</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="O(1)" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Body: Code (left) + Reflections (right) */}
            <div className="flex-1 min-h-0 grid grid-cols-[3fr_2fr] divide-x">
              {/* Code */}
              <div className="flex flex-col gap-1.5 p-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="flex flex-col flex-1 min-h-0">
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Paste your solution here..."
                          className="flex-1 resize-none font-mono text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Reflections */}
              <div className="flex flex-col gap-4 p-6 overflow-y-auto">
                <FormField
                  control={form.control}
                  name="learned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What I learned</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} placeholder="Key insights..." />
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
                        <Textarea {...field} rows={4} placeholder="Patterns to remember..." />
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
                        <Textarea {...field} rows={4} placeholder="Additional notes..." />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={logMutation.isPending || updateMutation.isPending}
              >
                {isEdit ? "Update" : "Log Attempt"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
