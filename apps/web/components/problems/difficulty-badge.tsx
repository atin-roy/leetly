import { Badge } from "@/components/ui/badge"
import tone from "@/components/ui/tone.module.css"
import { cn } from "@/lib/utils"
import type { Difficulty } from "@/lib/types"

const tones: Record<Difficulty, string> = {
  EASY: cn(tone.tone, tone.green),
  MEDIUM: cn(tone.tone, tone.amber),
  HARD: cn(tone.tone, tone.red),
}

const labels: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
}

export { tones as difficultyTones, labels as difficultyLabels }

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: Difficulty
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn(tones[difficulty], className)}>
      {labels[difficulty]}
    </Badge>
  )
}
