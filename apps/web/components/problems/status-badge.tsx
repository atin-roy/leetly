import { Badge } from "@/components/ui/badge"
import type { ProblemStatus } from "@/lib/types"

const styles: Record<ProblemStatus, string> = {
  UNSEEN: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400",
  ATTEMPTED: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400",
  SOLVED_WITH_HELP: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
  SOLVED: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400",
  MASTERED: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400",
}

const labels: Record<ProblemStatus, string> = {
  UNSEEN: "Unseen",
  ATTEMPTED: "Attempted",
  SOLVED_WITH_HELP: "Solved w/ Help",
  SOLVED: "Solved",
  MASTERED: "Mastered",
}

export { labels as statusLabels, styles as statusStyles }

export function StatusBadge({ status }: { status: ProblemStatus }) {
  return (
    <Badge variant="outline" className={styles[status]}>
      {labels[status]}
    </Badge>
  )
}
