import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { HeroPanel } from "@/components/demo/surfaces"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDemoList } from "@/lib/demo-data"

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const list = getDemoList(Number(id))

  if (!list) notFound()

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="px-0">
        <Link href="/lists">
          <ArrowLeft className="size-4" />
          Back to Lists
        </Link>
      </Button>

      <HeroPanel
        eyebrow="List detail"
        title={list.name}
        description={list.description}
        kicker={`${list.problems.length} problems · ${list.cadence}`}
        aside={
          <div className="panel h-full p-6">
            <p className="eyebrow">{list.subtitle}</p>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              This route now reads like a short editorial collection note. It gives the set a point of view before you drop into the linked problems.
            </p>
          </div>
        }
      />

      <section className="grid gap-4 lg:grid-cols-2">
        {list.problems.map((problem) => (
          <Card key={problem.id} className="p-6">
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{problem.difficulty}</Badge>
                <Badge variant="outline">{problem.pattern}</Badge>
                <Badge variant={problem.inReview ? "default" : "outline"}>
                  {problem.inReview ? "In review" : "Archive"}
                </Badge>
              </div>
              <CardTitle className="text-3xl">{problem.title}</CardTitle>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">{problem.summary}</p>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="text-sm text-[var(--text-muted)]">
                <p>{problem.topic}</p>
                <p>{problem.nextReview}</p>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/problems/${problem.id}`}>
                  Open problem
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
