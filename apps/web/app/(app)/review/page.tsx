import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { HeroPanel, MetricStrip, SectionHeader } from "@/components/demo/surfaces"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDemoReviewQueue } from "@/lib/demo-data"

export default function ReviewPage() {
  const reviewItems = getDemoReviewQueue()

  return (
    <div className="space-y-6">
      <HeroPanel
        eyebrow="Review queue"
        title="Spaced repetition with enough hierarchy to feel urgent."
        description="The redesign treats review as a priority workflow instead of a leftover list. Due states, reasons, and intervals are all visible without overcrowding the layout."
        kicker={`${reviewItems.length} active cards in mock queue`}
      />

      <MetricStrip
        items={[
          { label: "Due now", value: "1", change: "LIS needs immediate cleanup", tone: "warning" },
          { label: "Tonight", value: "1", change: "graph retry scheduled", tone: "warning" },
          { label: "Within 1 hour", value: "1", change: "LRU keeps interview fluency", tone: "positive" },
          { label: "Queue tone", value: "Focused", change: "small and deliberate", tone: "neutral" },
        ]}
      />

      <Card className="p-6">
        <CardHeader>
          <SectionHeader
            eyebrow="Active cards"
            title="The next problems worth re-opening"
            description="The card treatments are intentionally richer than stock list rows so the review state feels editorially ranked."
          />
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {reviewItems.map((item) => (
            <div key={item.id} className="panel h-full p-5">
              <div className="flex items-center justify-between gap-3">
                <Badge variant={item.dueLabel === "Due now" ? "default" : "outline"}>{item.dueLabel}</Badge>
                <Badge variant="secondary">{item.difficulty}</Badge>
              </div>
              <CardTitle className="mt-4 text-3xl">{item.title}</CardTitle>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{item.reason}</p>
              <div className="mt-5 flex items-center justify-between text-sm text-[var(--text-muted)]">
                <span>{item.pattern}</span>
                <span>{item.interval}</span>
              </div>
              <Button variant="ghost" className="mt-4 px-0" asChild>
                <Link href={`/problems/${item.problemId}`}>
                  Open problem
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
