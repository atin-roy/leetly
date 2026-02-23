"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ProblemTable } from "@/components/problems/problem-table"
import { useProblemList } from "@/hooks/use-lists"

export default function ListDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const id = Number(params.id)
  const { data: list, isLoading } = useProblemList(id)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!list) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        List not found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/lists">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{list.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {list.problems.length} problem{list.problems.length !== 1 ? "s" : ""}
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          <ProblemTable problems={list.problems} />
        </CardContent>
      </Card>
    </div>
  )
}
