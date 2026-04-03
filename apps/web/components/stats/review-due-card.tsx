"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useReviewStats } from "@/hooks/use-reviews"

export function ReviewDueCard() {
  const { data: stats, isLoading } = useReviewStats()

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16" />
        </CardContent>
      </Card>
    )
  }

  const dueNow = stats?.dueNow ?? 0

  return (
    <Link href="/review">
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Due for Review</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${dueNow > 0 ? "text-orange-500" : ""}`}>
            {dueNow}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {dueNow === 0 ? "All caught up" : `${dueNow} problem${dueNow === 1 ? "" : "s"} to review`}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
