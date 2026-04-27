"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Layers3, Plus, Sparkles, Target } from "lucide-react"
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
  DialogTrigger,
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
import { useProblems } from "@/hooks/use-problems"
import { getListStats } from "@/lib/stats"
import { cn } from "@/lib/utils"

const schema = z.object({ name: z.string().min(1, "Name is required") })

export default function ListsPage() {
  const { data: lists, isLoading } = useProblemLists()
  const { data: problems } = useProblems({ size: 200 })
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
    const aggregate = getListStats(problems?.content)

    return {
      listCount,
      totalProblems,
      completed: aggregate.completed,
      remaining: aggregate.remaining,
      mastered: aggregate.mastered,
      completionRate: aggregate.completionRate,
    }
  }, [problems?.content, sortedLists])

  const heroStats = [
    {
      label: "Lists",
      value: overview.listCount,
      detail: `${overview.totalProblems} total placements`,
      icon: Layers3,
      tone: "text-primary",
    },
    {
      label: "Solved",
      value: overview.completed,
      detail: `${overview.completionRate}% overall completion`,
      icon: CheckCircle2,
      tone: "text-emerald-500",
    },
    {
      label: "Remaining",
      value: overview.remaining,
      detail: "Problems still in rotation",
      icon: Target,
      tone: "text-amber-500",
    },
    {
      label: "Mastered",
      value: overview.mastered,
      detail: "Fully locked-in problems",
      icon: Sparkles,
      tone: "text-sky-500",
    },
  ]

  return (
    <div className="space-y-6">
      <section
        className="overflow-hidden rounded-[30px] border border-border/70 shadow-[0_30px_90px_color-mix(in_oklab,var(--foreground)_10%,transparent)]"
        style={{
          background: [
            "radial-gradient(circle at 12% 18%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 34%)",
            "radial-gradient(circle at 82% 14%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 32%)",
            "linear-gradient(145deg, color-mix(in srgb, var(--card) 92%, var(--background) 8%), color-mix(in srgb, var(--background) 94%, var(--card) 6%))",
          ].join(", "),
        }}
      >
        <div className="flex flex-col gap-6 p-5 sm:p-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Curated Problem Buckets
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                My Lists
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Group problems by pattern, topic, or study goal, then track how much of each bucket is actually moving.
              </p>
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-10 rounded-full px-4 text-sm">
                <Plus className="mr-1.5 h-4 w-4" />
                New List
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create List</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Sliding Window, Graph Warmups, Mock Interview Set..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      className="rounded-full"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending} className="rounded-full">
                      Create
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-3 border-t border-border/60 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
          {heroStats.map(({ label, value, detail, icon: Icon, tone }) => (
            <div key={label} className="rounded-2xl border border-border/70 bg-background/55 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
                </div>
                <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card/80", tone)}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            List Catalog
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            {sortedLists.length} active list{sortedLists.length === 1 ? "" : "s"}
          </h2>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="rounded-full">
              <Plus className="mr-1 h-4 w-4" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create List</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="My favorite problems" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} className="rounded-full">
                    Create
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[390px] rounded-[28px]" />
          ))}
        </div>
      ) : !sortedLists.length ? (
        <div className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-border/70 bg-card/45 px-6 text-center">
          <Layers3 className="h-8 w-8 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-base font-medium text-foreground">No lists yet</p>
            <p className="text-sm text-muted-foreground">
              Start with a topic bucket, interview set, or pattern rotation.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="rounded-full">
            <Plus className="mr-1.5 h-4 w-4" />
            Create your first list
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sortedLists.map((list) => (
            <ListCard key={list.id} list={list} problems={problems?.content ?? []} />
          ))}
        </div>
      )}
    </div>
  )
}
