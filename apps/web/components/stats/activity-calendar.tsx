"use client"

import { addDays, format, startOfWeek, subDays } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { useDailyStats } from "@/hooks/use-stats"

const WEEKS = 26

function getIntensity(count: number): string {
  if (count === 0) return "bg-muted"
  if (count === 1) return "bg-primary/30"
  if (count <= 3) return "bg-primary/60"
  return "bg-primary"
}

export function ActivityCalendar() {
  const { data: daily, isLoading } = useDailyStats(WEEKS * 7)

  if (isLoading) {
    return (
      <div className="flex gap-1">
        {Array.from({ length: WEEKS }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, j) => (
              <Skeleton key={j} className="h-3 w-3 rounded-sm" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  const statsMap = new Map(daily?.map((d) => [d.date, d]) ?? [])

  const today = new Date()
  const startDate = startOfWeek(subDays(today, WEEKS * 7 - 1), { weekStartsOn: 0 })

  const weeks: Array<Array<{ date: Date; count: number }>> = []
  let current = startDate

  for (let w = 0; w < WEEKS; w++) {
    const week: Array<{ date: Date; count: number }> = []
    for (let d = 0; d < 7; d++) {
      const dateStr = format(current, "yyyy-MM-dd")
      const stat = statsMap.get(dateStr)
      week.push({ date: current, count: stat?.solved ?? 0 })
      current = addDays(current, 1)
    }
    weeks.push(week)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map(({ date, count }) => (
                <Tooltip key={format(date, "yyyy-MM-dd")}>
                  <TooltipTrigger asChild>
                    <div
                      className={`h-3 w-3 rounded-sm ${getIntensity(count)} cursor-default`}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">
                      {format(date, "MMM d")} – {count} solved
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
