import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCards } from "@/components/stats/stats-cards"
import { DifficultyBreakdown } from "@/components/stats/difficulty-breakdown"
import { ActivityBar } from "@/components/stats/activity-calendar"
import { MistakesChart } from "@/components/stats/mistakes-chart"
import { PatternBreakdown } from "@/components/stats/pattern-breakdown"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <StatsCards />

      <DifficultyBreakdown />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Activity (last 90 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityBar />
        </CardContent>
      </Card>

      <MistakesChart />
      <PatternBreakdown />
    </div>
  )
}
