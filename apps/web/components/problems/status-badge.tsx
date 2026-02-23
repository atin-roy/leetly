import { Badge } from "@/components/ui/badge"
import type { ProblemStatus } from "@/lib/types"

const styles: Record<ProblemStatus, string> = {
  UNSEEN: "bg-gray-100 text-gray-600 border-gray-200",
  ATTEMPTED: "bg-orange-100 text-orange-700 border-orange-200",
  SOLVED_WITH_HELP: "bg-blue-100 text-blue-700 border-blue-200",
  SOLVED: "bg-green-100 text-green-700 border-green-200",
  MASTERED: "bg-purple-100 text-purple-700 border-purple-200",
}

const labels: Record<ProblemStatus, string> = {
  UNSEEN: "Unseen",
  ATTEMPTED: "Attempted",
  SOLVED_WITH_HELP: "Solved w/ Help",
  SOLVED: "Solved",
  MASTERED: "Mastered",
}

export function StatusBadge({ status }: { status: ProblemStatus }) {
  return (
    <Badge variant="outline" className={styles[status]}>
      {labels[status]}
    </Badge>
  )
}
