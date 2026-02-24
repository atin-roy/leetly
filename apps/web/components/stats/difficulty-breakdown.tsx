import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// TODO: replace with real data from useUserStats()
const DIFFICULTIES = [
  {
    label: "Easy",
    solved: 54,
    total: 820,
    colorText: "text-green-500",
    colorBar: "bg-green-500",
  },
  {
    label: "Medium",
    solved: 58,
    total: 1624,
    colorText: "text-yellow-500",
    colorBar: "bg-yellow-500",
  },
  {
    label: "Hard",
    solved: 15,
    total: 697,
    colorText: "text-red-500",
    colorBar: "bg-red-500",
  },
]

export function DifficultyBreakdown() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {DIFFICULTIES.map(({ label, solved, total, colorText, colorBar }) => (
        <Card key={label}>
          <CardContent className="pb-5 pt-5">
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                colorText
              )}
            >
              {label}
            </p>
            <p className="mt-1.5 text-3xl font-bold">{solved}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">of {total}</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", colorBar)}
                style={{
                  width: `${((solved / total) * 100).toFixed(1)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
