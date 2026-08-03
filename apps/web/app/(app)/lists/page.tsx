"use client"

import { useMemo, useState } from "react"
import { Layers3, Plus } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { ListCard } from "@/components/lists/list-card"
import { useCreateList, useProblemLists } from "@/hooks/use-lists"
import { getListStats } from "@/lib/stats"
import styles from "./lists.module.css"

const schema = z.object({ name: z.string().min(1, "Name is required") })

export default function ListsPage() {
  const { data: lists, isLoading } = useProblemLists()
  const createMutation = useCreateList()
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  })

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      await createMutation.mutateAsync(values)
      toast.success("List created")
      form.reset()
      setOpen(false)
    } catch {
      toast.error("Failed to create list")
    }
  }

  const sortedLists = useMemo(
    () =>
      [...(lists ?? [])].sort((a, b) => {
        if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1
        return b.problems.length - a.problems.length
      }),
    [lists],
  )

  const overview = useMemo(() => {
    const listCount = sortedLists.length
    const totalProblems = sortedLists.reduce((sum, list) => sum + list.problems.length, 0)

    // Derived from the lists already loaded. This previously fetched the first
    // 200 problems separately, which was both an extra request and a silently
    // truncated aggregate once a user passed 200 problems.
    const distinctProblems = new Map(
      sortedLists.flatMap((list) => list.problems).map((problem) => [problem.id, problem]),
    )
    const aggregate = getListStats([...distinctProblems.values()])

    return {
      listCount,
      totalProblems,
      completed: aggregate.completed,
      remaining: aggregate.remaining,
      mastered: aggregate.mastered,
      completionRate: aggregate.completionRate,
    }
  }, [sortedLists])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Lists</p>
          <h1 className={styles.title}>
            {overview.listCount} {overview.listCount === 1 ? "list" : "lists"}.
          </h1>
          <p className={styles.lede}>
            Group problems by pattern, topic or study goal, then see how much of
            each bucket is actually moving.
          </p>
        </div>

        <div className={styles.actions}>
          <Button onClick={() => setOpen(true)}>
            <Plus />
            New list
          </Button>
        </div>
      </header>

      <div className={styles.facts}>
        <Fact
          label="Placements"
          value={overview.totalProblems}
          caption="Across all lists"
        />
        <Fact
          label="Solved"
          value={overview.completed}
          caption={`${overview.completionRate}% complete`}
        />
        <Fact
          label="Remaining"
          value={overview.remaining}
          caption="Still in rotation"
        />
        <Fact label="Mastered" value={overview.mastered} caption="Locked in" />
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : !sortedLists.length ? (
        <div className={styles.empty}>
          <Layers3 size={32} className={styles.emptyIcon} aria-hidden="true" />
          <div>
            <p className={styles.emptyTitle}>No lists yet</p>
            <p className={styles.emptyBody}>
              Start with a topic bucket, an interview set, or a pattern rotation.
            </p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus />
            Create your first list
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {sortedLists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}

      {/* One dialog for both entry points. It used to be written out twice
          against this same state, so opening it mounted two copies. */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create list</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Sliding window, graph warmups…" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className={styles.formActions}>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  Create
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Fact({
  label,
  value,
  caption,
}: {
  label: string
  value: number | string
  caption?: string
}) {
  return (
    <div className={styles.fact}>
      <span className={styles.factLabel}>{label}</span>
      <span className={styles.factValue}>{value}</span>
      {caption && <span className={styles.factCaption}>{caption}</span>}
    </div>
  )
}
