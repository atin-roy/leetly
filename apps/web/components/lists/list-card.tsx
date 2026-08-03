"use client"

import Link from "next/link"
import { ArrowUpRight, CheckCircle2, Layers3, Sparkles, Target, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import tones from "@/components/ui/tone.module.css"
import { useDeleteList } from "@/hooks/use-lists"
import { getListDisplayName, getListHref } from "@/lib/list-display"
import { getListStats } from "@/lib/stats"
import { cn } from "@/lib/utils"
import type { ProblemListDto } from "@/lib/types"
import { AddProblemToListDialog } from "./add-problem-to-list-dialog"
import styles from "./list-card.module.css"

export function ListCard({ list }: { list: ProblemListDto }) {
  const deleteMutation = useDeleteList()
  const displayListName = getListDisplayName(list)
  const stats = getListStats(list.problems)

  const difficultyItems = [
    { label: "Easy", value: stats.byDifficulty.EASY, tone: cn(tones.toneText, tones.green) },
    { label: "Medium", value: stats.byDifficulty.MEDIUM, tone: cn(tones.toneText, tones.amber) },
    { label: "Hard", value: stats.byDifficulty.HARD, tone: cn(tones.toneText, tones.red) },
  ]

  const statItems = [
    {
      label: "Remaining",
      value: stats.remaining,
      icon: Target,
      tone: cn(tones.toneText, tones.amber),
    },
    {
      label: "Solved",
      value: stats.completed,
      icon: CheckCircle2,
      tone: cn(tones.toneText, tones.green),
    },
    {
      label: "Mastered",
      value: stats.mastered,
      icon: Sparkles,
      tone: cn(tones.toneText, tones.blue),
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
    <article className={styles.card}>
      <div className={styles.head}>
        <div className={styles.headText}>
          <div className={styles.badgeLine}>
            <span className={styles.mark}>
              <Layers3 size={16} aria-hidden="true" />
            </span>
            {list.isDefault ? <Badge variant="secondary">Default</Badge> : null}
          </div>
          <Link href={getListHref(list)} className={styles.name}>
            {displayListName}
            <ArrowUpRight size={16} className={styles.nameArrow} aria-hidden="true" />
          </Link>
          <p className={styles.count}>
            {stats.total} problem{stats.total !== 1 ? "s" : ""} in this list
          </p>
        </div>

        {!list.isDefault && (
          <Button
            variant="ghost"
            size="icon-sm"
            className={styles.delete}
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            title={`Delete ${displayListName}`}
          >
            <Trash2 />
          </Button>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.progress}>
          <div className={styles.progressHead}>
            <div>
              <p className={styles.progressLabel}>Progress</p>
              <div className={styles.progressValue}>
                <span className={styles.progressCount}>{stats.completed}</span>
                <span className={styles.progressTotal}>/ {stats.total} completed</span>
              </div>
            </div>
            <span className={styles.progressRate}>{stats.completionRate}%</span>
          </div>
          <Progress value={stats.completionRate} className={styles.progressBar} />
        </div>

        <div className={styles.stats}>
          {statItems.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className={styles.stat}>
              <span className={cn(styles.statIcon, tone)}>
                <Icon size={14} />
              </span>
              <span className={styles.statValue}>{value}</span>
              <p className={styles.statLabel}>{label}</p>
            </div>
          ))}
        </div>

        <div className={styles.mix}>
          <div className={styles.mixHead}>
            <p className={styles.mixLabel}>Difficulty mix</p>
            <p className={styles.mixNote}>
              {stats.attempted > 0
                ? `${stats.attempted} in progress`
                : stats.unseen > 0
                  ? `${stats.unseen} unseen`
                  : "No backlog"}
            </p>
          </div>
          <div className={styles.mixRow}>
            {difficultyItems.map(({ label, value, tone }) => (
              <div key={label} className={styles.mixChip}>
                <span className={styles.mixChipValue}>{value}</span>{" "}
                <span className={tone}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.foot}>
          <div className={styles.footText}>
            <p className={styles.footPrimary}>
              {stats.solvedWithHelp > 0
                ? `${stats.solvedWithHelp} solved with help`
                : "Keep the momentum going"}
            </p>
            <p className={styles.footSecondary}>
              {stats.total > 0
                ? `${stats.remaining} still left in this rotation`
                : "Start filling this list with a focused backlog."}
            </p>
          </div>
          <AddProblemToListDialog
            listId={list.id}
            listName={displayListName}
            listProblemIds={list.problems.map((problem) => problem.id)}
            buttonVariant="outline"
          />
        </div>
      </div>
    </article>
  )
}
