"use client"

import Link from "next/link"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDeleteList } from "@/hooks/use-lists"
import type { ProblemListDto, ProblemSummaryDto } from "@/lib/types"
import { AddProblemToListDialog } from "./add-problem-to-list-dialog"

export function ListCard({
  list,
  problems,
}: {
  list: ProblemListDto
  problems: ProblemSummaryDto[]
}) {
  const deleteMutation = useDeleteList()

  async function handleDelete() {
    if (!confirm(`Delete list "${list.name}"?`)) return
    try {
      await deleteMutation.mutateAsync(list.id)
      toast.success("List deleted")
    } catch {
      toast.error("Failed to delete list")
    }
  }

  return (
    <Card className="group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            <Link href={`/lists/${list.id}`} className="hover:underline">
              {list.name}
            </Link>
          </CardTitle>
          <div className="flex items-center gap-2">
            {list.isDefault && <Badge variant="secondary">Default</Badge>}
            {!list.isDefault && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {list.problems.length} problem{list.problems.length !== 1 ? "s" : ""}
          </p>
          <AddProblemToListDialog
            listId={list.id}
            listName={list.name}
            listProblemIds={list.problems.map((problem) => problem.id)}
            problems={problems}
            buttonVariant="outline"
          />
        </div>
      </CardContent>
    </Card>
  )
}
