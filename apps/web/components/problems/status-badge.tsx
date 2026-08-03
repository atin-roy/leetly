import { Badge } from "@/components/ui/badge"
import tone from "@/components/ui/tone.module.css"
import { cn } from "@/lib/utils"
import type { ProblemStatus } from "@/lib/types"

const tones: Record<ProblemStatus, string> = {
  UNSEEN: cn(tone.tone, tone.neutral),
  ATTEMPTED: cn(tone.tone, tone.amber),
  SOLVED_WITH_HELP: cn(tone.tone, tone.blue),
  SOLVED: cn(tone.tone, tone.green),
  MASTERED: cn(tone.tone, tone.violet),
}

const labels: Record<ProblemStatus, string> = {
  UNSEEN: "Unseen",
  ATTEMPTED: "Attempted",
  SOLVED_WITH_HELP: "Solved w/ Help",
  SOLVED: "Solved",
  MASTERED: "Mastered",
}

export { labels as statusLabels, tones as statusStyles }

export function StatusBadge({
  status,
  className,
}: {
  status: ProblemStatus
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn(tones[status], className)}>
      {labels[status]}
    </Badge>
  )
}
