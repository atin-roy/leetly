import { ActivityStrip, HeroPanel, InsightCard, MetricStrip, MiniBars, SectionHeader } from "@/components/demo/surfaces"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDemoDashboard, getDemoSession } from "@/lib/demo-data"

export default function DashboardPage() {
  const dashboard = getDemoDashboard()
  const session = getDemoSession()

  return (
    <div className="space-y-6">
      <HeroPanel
        eyebrow={dashboard.hero.eyebrow}
        title={dashboard.hero.title}
        description={dashboard.hero.description}
        kicker={dashboard.hero.kicker}
        aside={
          <div className="panel h-full p-6">
            <p className="eyebrow">Current Focus</p>
            <p className="display-type mt-3 text-4xl">{session.focus}</p>
            <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
              This mock session makes the dashboard read like a working editor&apos;s desk: one active rewrite, one queue that needs discipline, and a streak that still feels earned.
            </p>
          </div>
        }
      />

      <MetricStrip items={dashboard.metricStrip} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card className="p-6">
          <CardHeader>
            <SectionHeader
              eyebrow="Weekly velocity"
              title="Solve rhythm over the last seven days"
              description="Not a chart for chart&apos;s sake. The bars are here to show the pacing shift after moving to more deliberate review notes."
            />
          </CardHeader>
          <CardContent>
            <MiniBars data={dashboard.weeklyVelocity} />
          </CardContent>
        </Card>
        <Card className="p-6">
          <CardHeader>
            <SectionHeader
              eyebrow="Pattern focus"
              title="Where the current energy is going"
              description="Dynamic programming still dominates the editorial effort, with graph work close behind."
            />
          </CardHeader>
          <CardContent>
            <MiniBars data={dashboard.patternFocus} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {dashboard.insightCards.map((card) => (
          <InsightCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Fourteen days of dense, readable activity instead of a thin metrics slab.
            </p>
          </CardHeader>
          <CardContent>
            <ActivityStrip items={dashboard.activity} />
          </CardContent>
        </Card>
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Next Editorial Moves</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.timeline.map((item) => (
              <div key={item.title} className="rounded-[1.4rem] border border-[var(--border-default)] bg-[var(--surface-card)] p-4">
                <p className="eyebrow">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
