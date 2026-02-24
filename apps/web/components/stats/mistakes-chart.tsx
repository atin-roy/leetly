"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserStats } from "@/hooks/use-stats"

export function MistakesChart() {
  const { data: stats, isLoading } = useUserStats()

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />
  }

  // Parse the mistakeBreakdown JSON string from the backend
  let mistakes: { label: string; count: number }[] = []
  if (stats?.mistakeBreakdown) {
    try {
      const parsed = JSON.parse(stats.mistakeBreakdown) as Record<string, number>
      mistakes = Object.entries(parsed)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
    } catch {
      // Invalid JSON — show nothing
    }
  }

  if (mistakes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Mistakes by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-6 text-center text-sm text-muted-foreground">
            No mistake data yet. Start logging attempts to see your breakdown.
          </p>
        </CardContent>
      </Card>
    )
  }

  const max = Math.max(...mistakes.map((m) => m.count))
  const total = mistakes.reduce((s, m) => s + m.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Mistakes by Type</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mistakes.map(({ label, count }) => (
          <div key={label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium tabular-nums">
                {count}{" "}
                <span className="font-normal text-muted-foreground">
                  ({((count / total) * 100).toFixed(0)}%)
                </span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-destructive/70"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
