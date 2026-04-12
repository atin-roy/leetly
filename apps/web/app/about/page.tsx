import type { Metadata } from "next"
import { PublicShell } from "@/components/demo/public-shell"
import { HeroPanel, InsightCard, SectionHeader } from "@/components/demo/surfaces"

export const metadata: Metadata = {
  title: "About — Leetly Demo",
  description: "Why this branch rebuilds the Leetly frontend as an editorial-tech demo.",
}

export default function AboutPage() {
  return (
    <PublicShell currentPath="/about">
      <HeroPanel
        eyebrow="About the branch"
        title="Leetly is being restaged as a product critique, not a template refresh."
        description="The redesign keeps the current route map and implementation primitives where useful, but it rejects the generic shadcn visual language entirely. The result is a mock-driven branch meant for review, not parity."
        kicker="Frontend-only. Typed demo data. Local theme persistence."
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <InsightCard
          eyebrow="Direction"
          title="Editorial-tech, not thin SaaS minimalism."
          body="Typography carries more weight, surfaces feel printed and layered, and cards are treated like designed panels instead of white rectangles."
          footnote="The flagship theme is `index`."
        />
        <InsightCard
          eyebrow="Infrastructure"
          title="Same routes, different data path."
          body="Dashboard, problems, notes, review, lists, and account all read from one stable mock module. That keeps the redesign swappable later."
          footnote="No backend contracts were changed."
        />
        <InsightCard
          eyebrow="Reviewability"
          title="Demo mode removes friction for feedback."
          body="You can open `/dashboard` directly, switch themes locally, and inspect the redesigned surfaces without auth or flaky query states getting in the way."
          footnote="Useful for visual review and stakeholder walkthroughs."
        />
      </section>

      <section className="panel p-8 md:p-10">
        <SectionHeader
          eyebrow="What stays"
          title="The branch is still Leetly."
          description="Navigation categories, URLs, and the underlying notion of problems, review, notes, lists, and account settings all remain intact. The rewrite is about hierarchy, tone, and demo flow."
        />
      </section>
    </PublicShell>
  )
}
