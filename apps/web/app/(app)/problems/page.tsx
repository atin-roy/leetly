"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProblemFilters } from "@/components/problems/problem-filters"
import { ProblemTable } from "@/components/problems/problem-table"
import { useProblems } from "@/hooks/use-problems"
import type { ProblemFilters as Filters } from "@/lib/types"

const DEFAULT_FILTERS: Filters = { page: 0, size: 25 }

export default function ProblemsPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const { data, isLoading } = useProblems(filters)

  function handleChange(partial: Partial<Filters>) {
    setFilters((f) => ({ ...f, ...partial }))
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS)
  }

  const page = filters.page ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Problems</h1>
        {data && (
          <p className="text-sm text-muted-foreground">
            {data.totalElements} problems
          </p>
        )}
      </div>

      <ProblemFilters
        filters={filters}
        onChange={handleChange}
        onReset={handleReset}
      />

      <Card>
        <CardContent className="p-0">
          <ProblemTable
            problems={data?.content}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => handleChange({ page: page - 1 })}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => handleChange({ page: page + 1 })}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
