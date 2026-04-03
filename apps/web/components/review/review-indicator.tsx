import { Clock, Check, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { ReviewCardSummary } from "@/lib/types"

interface Props {
  reviewCard: ReviewCardSummary | null
}

export function ReviewIndicator({ reviewCard }: Props) {
  if (!reviewCard) return null

  const now = new Date()
  const due = new Date(reviewCard.due)
  const isOverdue = due < now
  const isDueToday = !isOverdue && due.toDateString() === now.toDateString()

  let icon: React.ReactNode
  let tooltip: string
  let colorClass: string

  if (isOverdue) {
    icon = <AlertCircle className="h-4 w-4" />
    tooltip = "Overdue for review"
    colorClass = "text-red-500"
  } else if (isDueToday) {
    icon = <Clock className="h-4 w-4" />
    tooltip = "Due for review today"
    colorClass = "text-orange-500"
  } else {
    icon = <Check className="h-4 w-4" />
    tooltip = `Next review: ${due.toLocaleDateString()}`
    colorClass = "text-green-500"
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex ${colorClass}`}>{icon}</span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
