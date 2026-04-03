"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useReviewStats } from "@/hooks/use-reviews"

export function ReviewStatsBar() {
  const { data: stats, isLoading } = useReviewStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const items = [
    { label: "Due Now", value: stats?.dueNow ?? 0, highlight: (stats?.dueNow ?? 0) > 0 },
    { label: "Upcoming (7d)", value: stats?.upcoming7Days ?? 0, highlight: false },
    { label: "Total Enrolled", value: stats?.totalEnrolled ?? 0, highlight: false },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map(({ label, value, highlight }) => (
        <Card key={label}>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${highlight ? "text-orange-500" : ""}`}>
              {value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
