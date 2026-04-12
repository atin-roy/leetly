import Link from "next/link"
import { ArrowUpRight, BookOpen, NotebookPen, Radar, ScanSearch, ShieldCheck, Sparkles } from "lucide-react"
import { PublicShell } from "@/components/demo/public-shell"
import { HeroPanel, InsightCard, MetricStrip, SectionHeader } from "@/components/demo/surfaces"
import { Button } from "@/components/ui/button"

const features = [
  {
    eyebrow: "Tracking",
    title: "Every attempt becomes readable context.",
    body:
      "Capture solve time, failure mode, and narrative quality so the archive feels like an annotated study desk, not a database dump.",
    footnote: "Attempts, timelines, and editorial notes stay connected.",
  },
  {
    eyebrow: "Review",
    title: "Spaced repetition gets visual weight.",
    body:
      "Review queues, related problems, and list curation all live inside one premium mock workflow built for critique and iteration.",
    footnote: "This branch bypasses auth to keep the demo frictionless.",
  },
  {
    eyebrow: "Theme",
    title: "Three presets, one tokenized system.",
    body:
      "Index, Paper Signal, and Night Grid share the same component contracts while typography, surfaces, and contrast stay CSS-driven.",
    footnote: "Theme persistence is local-only in this branch.",
  },
]

export default function Home() {
  return (
    <PublicShell currentPath="/">
      <HeroPanel
        eyebrow="Leetly redesign branch"
        title="An editorial-tech interface for studying code like it deserves scrutiny."
        description="This frontend-only demo keeps the route map, drops the stock shadcn feel, bypasses auth for review, and rebuilds the app around stronger hierarchy, clearer surfaces, and typed mock data."
        kicker="Public pages stay calm. App pages become the showroom."
        action={
          <>
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Open Dashboard
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">See Demo Entry</Link>
            </Button>
          </>
        }
        aside={
          <div className="grid gap-4">
            <div className="panel p-5">
              <p className="eyebrow">Branch Goals</p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-[var(--text-secondary)]">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-1 size-4 text-[var(--accent-solid)]" />
                  <p>Replace generic cards, tables, and menus with a distinct editorial system.</p>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 size-4 text-[var(--accent-solid)]" />
                  <p>Keep URLs stable while removing live backend dependency from redesigned routes.</p>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen className="mt-1 size-4 text-[var(--accent-solid)]" />
                  <p>Turn dashboard, problems, notes, and review into a coherent mock narrative.</p>
                </div>
              </div>
            </div>
          </div>
        }
      />

      <MetricStrip
        items={[
          { label: "Public pages", value: "4", change: "redesigned for review", tone: "positive" },
          { label: "App routes", value: "8", change: "demo-backed surfaces", tone: "positive" },
          { label: "Theme presets", value: "3", change: "CSS-token driven", tone: "neutral" },
          { label: "Auth friction", value: "0", change: "bypassed in demo mode", tone: "warning" },
        ]}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        {features.map((feature) => (
          <InsightCard key={feature.title} {...feature} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="panel p-8">
          <SectionHeader
            eyebrow="What changes"
            title="The branch is mock-first on purpose."
            description="Data comes from one typed demo source. Theme state is local-only. The app shell is reviewable without sign-in. The point is visual and interaction clarity, not API parity."
          />
        </div>
        <div className="panel p-8">
          <p className="eyebrow">Core surfaces</p>
          <div className="mt-5 grid gap-4 text-sm leading-6 text-[var(--text-secondary)]">
            <div className="flex items-start gap-3">
              <Radar className="mt-1 size-4 text-[var(--chart-3)]" />
              <p>Dashboard becomes the flagship editorial spread with metrics, bars, timeline, and activity texture.</p>
            </div>
            <div className="flex items-start gap-3">
              <ScanSearch className="mt-1 size-4 text-[var(--chart-4)]" />
              <p>Problems shift from stock table views to a designed workspace with filter chips and case-study detail pages.</p>
            </div>
            <div className="flex items-start gap-3">
              <NotebookPen className="mt-1 size-4 text-[var(--chart-1)]" />
              <p>Notes, lists, and account use the same visual system instead of falling back to generic settings UI.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
