"use client"

import Link from "next/link"
import { ArrowUpRight, CheckCircle2, Layers3, Sparkles, Target, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useDeleteList } from "@/hooks/use-lists"
import { getListDisplayName, getListHref } from "@/lib/list-display"
import { getListStats } from "@/lib/stats"
import { cn } from "@/lib/utils"
import type { ProblemListDto, ProblemSummaryDto } from "@/lib/types"
import { AddProblemToListDialog } from "./add-problem-to-list-dialog"

export function ListCard({
  list,
  problems,
}: {
  list: ProblemListDto
  problems: ProblemSummaryDto[]
}) {
  const deleteMutation = useDeleteList()
  const displayListName = getListDisplayName(list)
  const stats = getListStats(list.problems)
  const difficultyItems = [
    { label: "Easy", value: stats.byDifficulty.EASY, tone: "text-emerald-700 dark:text-emerald-400" },
    { label: "Medium", value: stats.byDifficulty.MEDIUM, tone: "text-amber-700 dark:text-amber-400" },
    { label: "Hard", value: stats.byDifficulty.HARD, tone: "text-rose-700 dark:text-rose-400" },
  ]
  const statItems = [
    {
      label: "Remaining",
      value: stats.remaining,
      icon: Target,
      tone: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Solved",
      value: stats.completed,
      icon: CheckCircle2,
      tone: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Mastered",
      value: stats.mastered,
      icon: Sparkles,
      tone: "text-sky-600 dark:text-sky-400",
    },
  ]

  async function handleDelete() {
    if (!confirm(`Delete list "${displayListName}"?`)) return
    try {
      await deleteMutation.mutateAsync(list.id)
      toast.success("List deleted")
    } catch {
      toast.error("Failed to delete list")
    }
  }

  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-border/70 bg-card/80 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_28px_80px_-42px_color-mix(in_oklab,var(--foreground)_16%,transparent)]">
      <div
        className="absolute inset-x-0 top-0 h-28"
        style={{
          background: [
            "linear-gradient(90deg, color-mix(in srgb, var(--primary) 10%, transparent), transparent 55%)",
            "radial-gradient(circle at 88% 14%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 28%)",
          ].join(", "),
        }}
      />
      <div className="relative border-b border-border/60 px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-primary/15 bg-background/90 text-primary shadow-sm">
                <Layers3 className="h-4 w-4" />
              </span>
              {list.isDefault ? (
                <Badge variant="secondary" className="rounded-full px-2.5 py-1">
                  Default
                </Badge>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Link
                href={getListHref(list)}
                className="inline-flex items-center gap-1.5 text-xl font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
              >
                {displayListName}
                <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <p className="text-sm text-muted-foreground">
                {stats.total} problem{stats.total !== 1 ? "s" : ""} in this list
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!list.isDefault && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="relative space-y-5 px-5 py-5">
        <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Progress
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight">{stats.completed}</span>
                <span className="text-sm text-muted-foreground">
                  / {stats.total} completed
                </span>
              </div>
            </div>
            <div className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-sm font-medium text-foreground shadow-sm">
              {stats.completionRate}%
            </div>
          </div>
          <Progress value={stats.completionRate} className="mt-3 h-2.5 bg-muted/80" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {statItems.map(({ label, value, icon: Icon, tone }) => (
            <div
              key={label}
              className="flex min-h-[5.5rem] flex-col items-center justify-center rounded-2xl border border-border/50 bg-background/55 p-3 text-center"
            >
              <div className={cn("mb-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-muted/80", tone)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="text-lg font-semibold leading-none">{value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-dashed border-border/70 bg-background/35 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Difficulty Mix
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.attempted > 0 ? `${stats.attempted} in progress` : stats.unseen > 0 ? `${stats.unseen} unseen` : "No backlog"}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {difficultyItems.map(({ label, value, tone }) => (
              <div
                key={label}
                className="rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-sm"
              >
                <span className="font-semibold">{value}</span>{" "}
                <span className={cn("font-medium", tone)}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-1">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">
              {stats.solvedWithHelp > 0 ? `${stats.solvedWithHelp} solved with help` : "Keep the momentum going"}
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? `${stats.remaining} still left in this rotation` : "Start filling this list with a focused backlog."}
            </p>
          </div>
          <AddProblemToListDialog
            listId={list.id}
            listName={displayListName}
            listProblemIds={list.problems.map((problem) => problem.id)}
            problems={problems}
            buttonVariant="outline"
            buttonClassName="rounded-full border-border/70 bg-background/70"
          />
        </div>
      </div>
    </article>
  )
}
