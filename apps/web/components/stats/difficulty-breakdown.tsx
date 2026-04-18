"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useProblems } from "@/hooks/use-problems"
import { cn } from "@/lib/utils"
import { getSolvedCountByDifficulty } from "@/lib/stats"

export function DifficultyBreakdown() {
  const { data: problemPage, isLoading } = useProblems({ size: 1000 })

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full" />
        ))}
      </div>
    )
  }

  const problems = problemPage?.content ?? []

  const difficulties = [
    {
      label: "Easy",
      solved: getSolvedCountByDifficulty(problems, "EASY"),
      colorText: "text-green-500",
      colorBar: "bg-green-500",
    },
    {
      label: "Medium",
      solved: getSolvedCountByDifficulty(problems, "MEDIUM"),
      colorText: "text-yellow-500",
      colorBar: "bg-yellow-500",
    },
    {
      label: "Hard",
      solved: getSolvedCountByDifficulty(problems, "HARD"),
      colorText: "text-red-500",
      colorBar: "bg-red-500",
    },
  ]

  const maxSolved = Math.max(...difficulties.map((d) => d.solved), 1)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {difficulties.map(({ label, solved, colorText, colorBar }) => (
        <Card key={label}>
          <CardContent className="pb-4 pt-4">
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                colorText
              )}
            >
              {label}
            </p>
            <p className="mt-1.5 text-2xl font-bold">{solved}</p>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", colorBar)}
                style={{
                  width: `${((solved / maxSolved) * 100).toFixed(1)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
