import Link from "next/link"
import { ArrowRight, ClipboardList, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReviewDueCard } from "@/components/stats/review-due-card"
import { StatsCards } from "@/components/stats/stats-cards"
import { DifficultyBreakdown } from "@/components/stats/difficulty-breakdown"
import { ActivityBar } from "@/components/stats/activity-calendar"
import { MistakesChart } from "@/components/stats/mistakes-chart"
import { PatternBreakdown } from "@/components/stats/pattern-breakdown"

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="relative overflow-hidden rounded-lg border border-border/75 bg-card/84 p-6 shadow-[0_24px_80px_color-mix(in_oklab,var(--foreground)_10%,transparent)] backdrop-blur-2xl sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--primary),var(--chart-2),var(--chart-3))]" />
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">Dashboard</p>
          <div className="mt-6 max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Solve rhythm</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
              Review what is due, spot weak patterns, and keep the next session obvious.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/problems">
                <ClipboardList className="h-4 w-4" />
                Problem library
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/review">
                <RotateCcw className="h-4 w-4" />
                Review queue
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
          <ReviewDueCard />
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Next moves</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <Link href="/problems" className="flex items-center justify-between rounded-lg border bg-background/55 px-3 py-2 text-foreground transition-colors hover:bg-accent">
                Add or filter problems
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/notes" className="flex items-center justify-between rounded-lg border bg-background/55 px-3 py-2 text-foreground transition-colors hover:bg-accent">
                Revisit notes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <StatsCards />

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
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
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <MistakesChart />
        <PatternBreakdown />
      </section>
    </div>
  )
}
