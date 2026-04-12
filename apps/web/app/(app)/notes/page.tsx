"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { EmptyStateBlock, HeroPanel } from "@/components/demo/surfaces"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDemoNotes, getDemoProblems } from "@/lib/demo-data"

type TagFilter = "all" | "Learning" | "Review" | "Interview" | "Strategy"

export default function NotesPage() {
  const notes = getDemoNotes()
  const problems = getDemoProblems()
  const [search, setSearch] = useState("")
  const [tag, setTag] = useState<TagFilter>("all")

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        search.trim().length === 0 ||
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.excerpt.toLowerCase().includes(search.toLowerCase())
      const matchesTag = tag === "all" || note.tag === tag
      return matchesSearch && matchesTag
    })
  }, [notes, search, tag])

  return (
    <div className="space-y-6">
      <HeroPanel
        eyebrow="Notes"
        title="An editorial notebook, not a grid of generic cards."
        description="The note surfaces are designed to feel like clipped working fragments: compact, typographic, and tied back to actual problem contexts where relevant."
        kicker={`${notes.length} curated notes in the mock library`}
      />

      <section className="panel p-6">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notes" className="pl-11" />
          </div>
          <Select value={tag} onValueChange={(value) => setTag(value as TagFilter)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              <SelectItem value="Learning">Learning</SelectItem>
              <SelectItem value="Review">Review</SelectItem>
              <SelectItem value="Interview">Interview</SelectItem>
              <SelectItem value="Strategy">Strategy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {filteredNotes.length === 0 ? (
        <EmptyStateBlock
          title="No notes match this filter."
          description="The page keeps a designed empty state instead of dropping to a bare message."
        />
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {filteredNotes.map((note) => {
            const linkedProblem = note.problemId
              ? problems.find((problem) => problem.id === note.problemId)
              : null

            return (
              <Card key={note.id} className="h-full p-6">
                <CardHeader className="gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary">{note.tag}</Badge>
                    <span className="text-xs text-[var(--text-muted)]">{note.date}</span>
                  </div>
                  <CardTitle className="text-3xl">{note.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-7 text-[var(--text-secondary)]">{note.excerpt}</p>
                  {linkedProblem ? (
                    <div className="rounded-[1.3rem] border border-[var(--border-default)] bg-[var(--surface-card)] p-4 text-sm text-[var(--text-secondary)]">
                      Linked problem: <span className="font-semibold text-[var(--text-primary)]">{linkedProblem.title}</span>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </section>
      )}
    </div>
  )
}
