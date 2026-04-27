"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useQuickReview } from "@/hooks/use-reviews"
import type { Rating } from "@/lib/types"
import { cn } from "@/lib/utils"

const RATINGS: { value: Rating; label: string; className: string }[] = [
  {
    value: "AGAIN",
    label: "Again",
    className:
      "border-rose-300/35 bg-rose-300/[0.08] text-rose-700 hover:border-rose-400/50 hover:bg-rose-300/[0.16] hover:text-rose-800 dark:text-rose-100 dark:hover:text-rose-50",
  },
  {
    value: "HARD",
    label: "Hard",
    className:
      "border-amber-300/35 bg-amber-300/[0.08] text-amber-700 hover:border-amber-400/50 hover:bg-amber-300/[0.16] hover:text-amber-800 dark:text-amber-100 dark:hover:text-amber-50",
  },
  {
    value: "GOOD",
    label: "Good",
    className:
      "border-cyan-300/35 bg-cyan-300/[0.08] text-cyan-700 hover:border-cyan-400/50 hover:bg-cyan-300/[0.16] hover:text-cyan-800 dark:text-cyan-100 dark:hover:text-cyan-50",
  },
  {
    value: "EASY",
    label: "Easy",
    className:
      "border-emerald-300/35 bg-emerald-300/[0.08] text-emerald-700 hover:border-emerald-400/50 hover:bg-emerald-300/[0.16] hover:text-emerald-800 dark:text-emerald-100 dark:hover:text-emerald-50",
  },
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
