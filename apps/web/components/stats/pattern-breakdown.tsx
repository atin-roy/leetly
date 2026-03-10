"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserStats } from "@/hooks/use-stats"

export function PatternBreakdown() {
  const { data: stats, isLoading } = useUserStats()

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />
  }

  let patterns: { label: string; count: number }[] = []
  if (stats?.patternBreakdown) {
    try {
      const parsed = JSON.parse(stats.patternBreakdown) as Record<string, number>
      patterns = Object.entries(parsed)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)
    } catch {
      patterns = []
    }
  }

  if (patterns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-6 text-center text-sm text-muted-foreground">
            No pattern data yet. Tag problems with patterns to see the breakdown.
          </p>
        </CardContent>
      </Card>
    )
  }

  const max = Math.max(...patterns.map((pattern) => pattern.count))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Patterns</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {patterns.map(({ label, count }) => (
          <div key={label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-muted-foreground">{label}</span>
              <span className="font-medium tabular-nums">{count}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/80"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
