import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// TODO: replace with real pattern attempt counts from API
const DUMMY_PATTERNS = [
  { name: "Two Pointers", topic: "Arrays", count: 23 },
  { name: "Dynamic Programming", topic: "DP", count: 19 },
  { name: "Binary Search", topic: "Search", count: 17 },
  { name: "Sliding Window", topic: "Arrays", count: 15 },
  { name: "BFS / DFS", topic: "Graphs", count: 12 },
  { name: "Tree Traversal", topic: "Trees", count: 11 },
  { name: "Sorting", topic: "Arrays", count: 9 },
  { name: "Hash Map", topic: "Hashing", count: 8 },
]

export function PatternBreakdown() {
  const max = Math.max(...DUMMY_PATTERNS.map((p) => p.count))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Problems by Pattern</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {DUMMY_PATTERNS.map(({ name, topic, count }) => (
          <div key={name}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium">{name}</span>
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                  {topic}
                </Badge>
              </div>
              <span className="tabular-nums text-muted-foreground">{count}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/60"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
