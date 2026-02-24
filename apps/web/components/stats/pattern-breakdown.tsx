"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { getPatterns } from "@/lib/api"

export function PatternBreakdown() {
  const { data: session } = useSession()
  const { data: patterns, isLoading } = useQuery({
    queryKey: ["patterns"],
    queryFn: () => getPatterns(session?.accessToken),
    enabled: !!session?.accessToken,
  })

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />
  }

  if (!patterns || patterns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Problems by Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-6 text-center text-sm text-muted-foreground">
            No patterns tracked yet. Add patterns to your problems to see a breakdown.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Patterns</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {patterns.map(({ id, name, topicName }) => (
          <div key={id} className="flex items-center gap-2 text-xs">
            <span className="font-medium">{name}</span>
            {topicName && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                {topicName}
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
