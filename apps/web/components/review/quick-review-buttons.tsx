"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import tone from "@/components/ui/tone.module.css"
import { useQuickReview } from "@/hooks/use-reviews"
import type { Rating } from "@/lib/types"
import { cn } from "@/lib/utils"

const RATINGS: { value: Rating; label: string; className: string }[] = [
  { value: "AGAIN", label: "Again", className: cn(tone.toneButton, tone.red) },
  { value: "HARD", label: "Hard", className: cn(tone.toneButton, tone.amber) },
  { value: "GOOD", label: "Good", className: cn(tone.toneButton, tone.cyan) },
  { value: "EASY", label: "Easy", className: cn(tone.toneButton, tone.green) },
]

interface Props {
  cardId: number
  size?: "sm" | "default"
  className?: string
  buttonClassName?: string
}

export function QuickReviewButtons({
  cardId,
  size = "sm",
  className,
  buttonClassName,
}: Props) {
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
    <div className={cn("flex flex-wrap gap-2", className)}>
      {RATINGS.map(({ value, label, className: toneClassName }) => (
        <Button
          key={value}
          variant="outline"
          size={size}
          disabled={reviewMutation.isPending}
          onClick={() => handleReview(value)}
          className={cn("min-w-0 flex-1", toneClassName, buttonClassName)}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
