"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useQuickReview } from "@/hooks/use-reviews"
import type { Rating } from "@/lib/types"

const RATINGS: { value: Rating; label: string; className: string }[] = [
  { value: "AGAIN", label: "Again", className: "text-red-600 hover:bg-red-50 border-red-200" },
  { value: "HARD", label: "Hard", className: "text-orange-600 hover:bg-orange-50 border-orange-200" },
  { value: "GOOD", label: "Good", className: "text-blue-600 hover:bg-blue-50 border-blue-200" },
  { value: "EASY", label: "Easy", className: "text-green-600 hover:bg-green-50 border-green-200" },
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
    <div className="flex gap-1">
      {RATINGS.map(({ value, label, className }) => (
        <Button
          key={value}
          variant="outline"
          size={size}
          disabled={reviewMutation.isPending}
          onClick={() => handleReview(value)}
          className={className}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
