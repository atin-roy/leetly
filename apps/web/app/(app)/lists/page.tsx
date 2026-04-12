import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { HeroPanel, SectionHeader } from "@/components/demo/surfaces"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDemoLists, getDemoProblems } from "@/lib/demo-data"

export default function ListsPage() {
  const lists = getDemoLists()
  const problems = getDemoProblems()

  return (
    <div className="space-y-6">
      <HeroPanel
        eyebrow="Lists"
        title="Curated problem sets with enough voice to justify their existence."
        description="The redesign drops the generic card gallery feel. Each list reads like a programmed track with a cadence, a thesis, and a visible problem count."
        kicker={`${lists.length} live demo lists`}
      />

      <section className="panel p-6">
        <SectionHeader
          eyebrow="Collection"
          title="Focused sets, not storage bins"
          description="Each list keeps a short rationale so the route feels curated instead of administrative."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {lists.map((list) => {
            const count = problems.filter((problem) => list.problemIds.includes(problem.id)).length

            return (
              <Card key={list.id} className="overflow-hidden p-0">
                <div className="h-28" style={{ background: list.gradient }} />
                <div className="p-6">
                  <CardHeader className="gap-3 px-0">
                    <Badge variant="secondary">{list.subtitle}</Badge>
                    <CardTitle className="text-3xl">{list.name}</CardTitle>
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">{list.description}</p>
                  </CardHeader>
                  <CardContent className="mt-5 space-y-4 px-0">
                    <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                      <span>{count} problems</span>
                      <span>{list.cadence}</span>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href={`/lists/${list.id}`}>
                        Open list
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </div>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
