import { Badge } from "@/components/ui/badge"
import type { Difficulty } from "@/lib/types"

const styles: Record<Difficulty, string> = {
  EASY: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400",
  HARD: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400",
}

const labels: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <Badge variant="outline" className={styles[difficulty]}>
      {labels[difficulty]}
    </Badge>
  )
}
