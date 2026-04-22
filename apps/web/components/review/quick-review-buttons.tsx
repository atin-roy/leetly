"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useQuickReview } from "@/hooks/use-reviews"
import type { Rating } from "@/lib/types"

const RATINGS: { value: Rating; label: string }[] = [
  { value: "AGAIN", label: "Again" },
  { value: "HARD", label: "Hard" },
  { value: "GOOD", label: "Good" },
  { value: "EASY", label: "Easy" },
]

interface Props {
  cardId: number
  size?: "sm" | "default"
}

export function QuickReviewButtons({ cardId, size = "sm" }: Props) {
  const reviewMutation = useQuickReview()

  async function handleReview(rating: Rating) {
    try {
      await reviewMutation.mutateAsync({ cardId, rating })
      toast.success(`Reviewed: ${rating.toLowerCase()}`)
    } catch {
      toast.error("Failed to submit review")
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {RATINGS.map(({ value, label }) => (
        <Button
          key={value}
          variant="secondary"
          size={size}
          disabled={reviewMutation.isPending}
          onClick={() => handleReview(value)}
          className="min-w-0"
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
