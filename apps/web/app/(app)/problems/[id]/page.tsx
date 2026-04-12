import { notFound } from "next/navigation"
import { ProblemDetailEditor } from "@/components/problems/problem-detail-editor"
import { getDemoProblem, getRelatedProblems } from "@/lib/demo-data"

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const problem = getDemoProblem(Number(id))

  if (!problem) notFound()

  const relatedProblems = getRelatedProblems(problem.relatedProblemIds)

  return <ProblemDetailEditor problem={problem} relatedProblems={relatedProblems} />
}
