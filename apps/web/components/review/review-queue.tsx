"use client"

import { useState } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DifficultyBadge } from "@/components/problems/difficulty-badge"
import { QuickReviewButtons } from "@/components/review/quick-review-buttons"
import { AttemptForm } from "@/components/problems/attempt-form"
import { useReviewCardsDue } from "@/hooks/use-reviews"

export function ReviewQueue() {
  const { data, isLoading } = useReviewCardsDue()
  const [attemptProblemId, setAttemptProblemId] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = data?.content ?? []

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No problems due for review. You&apos;re all caught up!
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {cards.map((card) => {
          const due = new Date(card.due)
          const now = new Date()
          const isOverdue = due < now

          return (
            <Card key={card.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">
                      {card.leetcodeId}
                    </span>
                    <Link
                      href={`/problems/${card.problemId}`}
                      className="font-medium hover:underline truncate"
                    >
                      {card.problemTitle}
                    </Link>
                    <a
                      href={card.problemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <DifficultyBadge difficulty={card.difficulty} />
                    <span>{card.reps} reviews</span>
                    <span>Stability: {card.stability.toFixed(1)}d</span>
                    {isOverdue && (
                      <Badge variant="outline" className="border-red-200 text-red-600 text-[10px]">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>
                <QuickReviewButtons cardId={card.id} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAttemptProblemId(card.problemId)}
                >
                  Log Attempt
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <AttemptForm
        open={attemptProblemId !== null}
        onOpenChange={(open) => {
          if (!open) setAttemptProblemId(null)
        }}
        problemId={attemptProblemId ?? 0}
      />
    </>
  )
}
