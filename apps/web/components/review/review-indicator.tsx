import { Clock, Check, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import tones from "@/components/ui/tone.module.css"
import styles from "./review-indicator.module.css"
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
  let tone: string

  if (isOverdue) {
    icon = <AlertCircle size={16} />
    tooltip = "Overdue for review"
    tone = tones.red
  } else if (isDueToday) {
    icon = <Clock size={16} />
    tooltip = "Due for review today"
    tone = tones.amber
  } else {
    icon = <Check size={16} />
    tooltip = `Next review: ${due.toLocaleDateString()}`
    tone = tones.green
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn(styles.icon, tones.toneText, tone)}>{icon}</span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
