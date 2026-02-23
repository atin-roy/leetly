import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityCalendar } from "@/components/stats/activity-calendar"
import { ProgressCard, StatsCards } from "@/components/stats/stats-cards"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Activity (last 6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityCalendar />
          </CardContent>
        </Card>

        <ProgressCard />
      </div>
    </div>
  )
}
