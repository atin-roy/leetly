"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, ExternalLink, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DifficultyBadge } from "@/components/problems/difficulty-badge"
import { StatusBadge } from "@/components/problems/status-badge"
import { AttemptForm } from "@/components/problems/attempt-form"
import { useProblem } from "@/hooks/use-problems"
import { useDeleteAttempt } from "@/hooks/use-attempts"
import type { AttemptDto } from "@/lib/types"

const OUTCOME_LABELS: Record<string, string> = {
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  TIME_LIMIT_EXCEEDED: "TLE",
  MEMORY_LIMIT_EXCEEDED: "MLE",
  RUNTIME_ERROR: "Runtime Error",
  NOT_COMPLETED: "Not Completed",
}

function AttemptCard({
  attempt,
  problemId,
  onEdit,
}: {
  attempt: AttemptDto
  problemId: number
  onEdit: (a: AttemptDto) => void
}) {
  const deleteMutation = useDeleteAttempt(problemId)

  async function handleDelete() {
    if (!confirm("Delete this attempt?")) return
    try {
      await deleteMutation.mutateAsync(attempt.id)
      toast.success("Attempt deleted")
    } catch {
      toast.error("Failed to delete attempt")
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Attempt #{attempt.attemptNumber}
            </span>
            <Badge
              variant="outline"
              className={
                attempt.outcome === "ACCEPTED"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }
            >
              {OUTCOME_LABELS[attempt.outcome] ?? attempt.outcome}
            </Badge>
            <Badge variant="secondary">{attempt.language}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(attempt)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {format(new Date(attempt.createdDate), "MMM d, yyyy 'at' h:mm a")}
          {attempt.durationMinutes && ` · ${attempt.durationMinutes}m`}
          {attempt.timeComplexity && ` · T: ${attempt.timeComplexity}`}
          {attempt.spaceComplexity && ` · S: ${attempt.spaceComplexity}`}
        </p>
      </CardHeader>
      {(attempt.learned || attempt.takeaways || attempt.notes) && (
        <CardContent className="space-y-2 text-sm">
          {attempt.learned && (
            <div>
              <span className="font-medium">Learned: </span>
              {attempt.learned}
            </div>
          )}
          {attempt.takeaways && (
            <div>
              <span className="font-medium">Takeaways: </span>
              {attempt.takeaways}
            </div>
          )}
          {attempt.notes && (
            <div>
              <span className="font-medium">Notes: </span>
              {attempt.notes}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default function ProblemDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const id = Number(params.id)
  const { data: problem, isLoading } = useProblem(id)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingAttempt, setEditingAttempt] = useState<AttemptDto | undefined>()

  function handleLogAttempt() {
    setEditingAttempt(undefined)
    setSheetOpen(true)
  }

  function handleEditAttempt(attempt: AttemptDto) {
    setEditingAttempt(attempt)
    setSheetOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Problem not found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/problems">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">
              #{problem.leetcodeId}
            </span>
            <h1 className="text-2xl font-semibold">{problem.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={problem.difficulty} />
            <StatusBadge status={problem.status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <Button size="sm" onClick={handleLogAttempt}>
            <Plus className="mr-1 h-4 w-4" />
            Log Attempt
          </Button>
        </div>
      </div>

      <Tabs defaultValue="attempts">
        <TabsList>
          <TabsTrigger value="attempts">
            Attempts ({problem.attempts.length})
          </TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="related">Related</TabsTrigger>
        </TabsList>

        <TabsContent value="attempts" className="mt-4">
          {problem.attempts.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <p>No attempts yet.</p>
              <Button size="sm" onClick={handleLogAttempt}>
                <Plus className="mr-1 h-4 w-4" />
                Log first attempt
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {problem.attempts.map((a) => (
                <AttemptCard
                  key={a.id}
                  attempt={a}
                  problemId={id}
                  onEdit={handleEditAttempt}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="topics" className="mt-4">
          {problem.topics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No topics assigned.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {problem.topics.map((t) => (
                <Badge key={t.id} variant="secondary">
                  {t.name}
                </Badge>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="mt-4">
          {problem.patterns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No patterns assigned.</p>
          ) : (
            <div className="space-y-2">
              {problem.patterns.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <Badge variant="outline">{p.name}</Badge>
                  {p.topicName && (
                    <span className="text-xs text-muted-foreground">
                      {p.topicName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="related" className="mt-4">
          {problem.relatedProblems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No related problems.</p>
          ) : (
            <div className="space-y-2">
              {problem.relatedProblems.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <Link
                    href={`/problems/${r.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    #{r.leetcodeId} {r.title}
                  </Link>
                  <DifficultyBadge difficulty={r.difficulty} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AttemptForm
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        problemId={id}
        attempt={editingAttempt}
      />
    </div>
  )
}
