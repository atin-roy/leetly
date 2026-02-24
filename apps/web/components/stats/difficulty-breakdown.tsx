"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useUserStats } from "@/hooks/use-stats"

export function DifficultyBreakdown() {
  const { data: stats, isLoading } = useUserStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  const difficulties = [
    {
      label: "Easy",
      solved: stats.easySolved,
      colorText: "text-green-500",
      colorBar: "bg-green-500",
    },
    {
      label: "Medium",
      solved: stats.mediumSolved,
      colorText: "text-yellow-500",
      colorBar: "bg-yellow-500",
    },
    {
      label: "Hard",
      solved: stats.hardSolved,
      colorText: "text-red-500",
      colorBar: "bg-red-500",
    },
  ]

  const maxSolved = Math.max(...difficulties.map((d) => d.solved), 1)

  return (
    <div className="grid grid-cols-3 gap-4">
      {difficulties.map(({ label, solved, colorText, colorBar }) => (
        <Card key={label}>
          <CardContent className="pb-5 pt-5">
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                colorText
              )}
            >
              {label}
            </p>
            <p className="mt-1.5 text-3xl font-bold">{solved}</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
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
