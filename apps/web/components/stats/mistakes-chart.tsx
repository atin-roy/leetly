import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// TODO: replace with real grouped mistake data from API
const DUMMY_MISTAKES = [
  { label: "Wrong Answer", count: 45 },
  { label: "Not Completed", count: 24 },
  { label: "Time Limit Exceeded", count: 18 },
  { label: "Runtime Error", count: 12 },
  { label: "Memory Limit Exceeded", count: 6 },
]

export function MistakesChart() {
  const max = Math.max(...DUMMY_MISTAKES.map((m) => m.count))
  const total = DUMMY_MISTAKES.reduce((s, m) => s + m.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Mistakes by Type</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {DUMMY_MISTAKES.map(({ label, count }) => (
          <div key={label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium tabular-nums">
                {count}{" "}
                <span className="font-normal text-muted-foreground">
                  ({((count / total) * 100).toFixed(0)}%)
                </span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-destructive/70"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
