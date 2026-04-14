import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReviewDueCard } from "@/components/stats/review-due-card"
import { StatsCards } from "@/components/stats/stats-cards"
import { DifficultyBreakdown } from "@/components/stats/difficulty-breakdown"
import { ActivityBar } from "@/components/stats/activity-calendar"
import { MistakesChart } from "@/components/stats/mistakes-chart"
import { PatternBreakdown } from "@/components/stats/pattern-breakdown"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-border/75 bg-card/80 px-5 py-6 shadow-sm backdrop-blur-xl sm:px-7">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Dashboard</p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Solve rhythm</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Review what is due, spot weak patterns, and keep the next session obvious.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
            <div className="rounded-lg border bg-background/55 px-3 py-2">Queue</div>
            <div className="rounded-lg border bg-background/55 px-3 py-2">Patterns</div>
            <div className="rounded-lg border bg-background/55 px-3 py-2">Streak</div>
          </div>
        </div>
      </div>

      <StatsCards />

      <ReviewDueCard />

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
