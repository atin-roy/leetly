"use client"

import { addDays, differenceInCalendarDays, format, parseISO, startOfWeek } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDailyStats } from "@/hooks/use-stats"
import { cn } from "@/lib/utils"

const CELL_SIZE = 12
const CELL_GAP = 4
const LABEL_COLUMN_W = 26
const WEEKDAY_ROWS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

function getCellTone(count: number) {
  if (count <= 0) return "bg-muted/35 border-border/35"
  if (count === 1) return "bg-primary/30 border-primary/25"
  if (count <= 3) return "bg-primary/50 border-primary/35"
  if (count <= 5) return "bg-primary/70 border-primary/45"
  return "bg-primary border-primary/60"
}

export function ConsistencyHeatmap() {
  const { data: dailyStats, isLoading } = useDailyStats()

  if (isLoading) {
    return <Skeleton className="h-[220px] w-full rounded-2xl" />
  }

  const firstSolvedStat = dailyStats?.find((stat) => stat.solved > 0)

  if (!firstSolvedStat) {
    return (
      <div className="flex h-[220px] items-center text-sm text-muted-foreground">
        No solved activity yet.
      </div>
    )
  }

  const today = new Date()
  const startDate = parseISO(firstSolvedStat.date)
  const rangeStart = startOfWeek(startDate, { weekStartsOn: 1 })
  const totalDays = Math.max(differenceInCalendarDays(today, startDate) + 1, 1)
  const countsMap = new Map<string, number>()

  for (const stat of dailyStats ?? []) {
    countsMap.set(stat.date, stat.solved)
  }

  const dates = Array.from({ length: totalDays }, (_, index) => {
    const date = addDays(startDate, index)
    const dateStr = format(date, "yyyy-MM-dd")
    return {
      date: dateStr,
      label: format(date, "MMM d, yyyy"),
      count: countsMap.get(dateStr) ?? 0,
      weekIndex: Math.floor(differenceInCalendarDays(date, rangeStart) / 7),
      weekdayIndex: (date.getDay() + 6) % 7,
      monthLabel: format(date, "MMM"),
      dayOfMonth: date.getDate(),
    }
  })

  const weekCount = dates.length > 0 ? Math.max(...dates.map((day) => day.weekIndex)) + 1 : 1
  const monthMarkers = Array.from({ length: weekCount }, (_, weekIndex) => {
    const marker = dates.find((day) => day.weekIndex === weekIndex && day.dayOfMonth <= 7)
    return marker?.monthLabel ?? ""
  })

  const chartWidth = weekCount * CELL_SIZE + Math.max(weekCount - 1, 0) * CELL_GAP

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-border/60 bg-background/18 p-4 sm:p-5">
        <div className="overflow-x-auto">
          <div className="mx-auto w-fit min-w-fit">
            <div className="flex gap-3">
              <div className="shrink-0" style={{ width: LABEL_COLUMN_W }}>
                <div className="h-5" />
                <div
                  className="grid"
                  style={{
                    gap: `${CELL_GAP}px`,
                    gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
                  }}
                >
                  {WEEKDAY_ROWS.map((label, index) => (
                    <div
                      key={label}
                      className="flex items-center text-[10px] leading-none text-muted-foreground"
                    >
                      {index % 2 === 0 ? label : ""}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div
                  className="grid h-5 items-end text-[10px] leading-none text-muted-foreground"
                  style={{
                    columnGap: `${CELL_GAP}px`,
                    gridTemplateColumns: `repeat(${weekCount}, ${CELL_SIZE}px)`,
                    width: chartWidth,
                  }}
                >
                  {monthMarkers.map((label, index) => (
                    <div key={`${label}-${index}`}>{label}</div>
                  ))}
                </div>

                <div
                  className="grid"
                  style={{
                    columnGap: `${CELL_GAP}px`,
                    rowGap: `${CELL_GAP}px`,
                    gridTemplateColumns: `repeat(${weekCount}, ${CELL_SIZE}px)`,
                    gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
                    width: chartWidth,
                  }}
                >
                  {Array.from({ length: weekCount * 7 }, (_, index) => {
                    const weekIndex = Math.floor(index / 7)
                    const weekdayIndex = index % 7
                    const day = dates.find(
                      (entry) =>
                        entry.weekIndex === weekIndex && entry.weekdayIndex === weekdayIndex
                    )

                    if (!day) {
                      return <div key={`empty-${index}`} className="h-3 w-3" />
                    }

                    return (
                      <Tooltip key={day.date}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "rounded-[4px] border transition-transform hover:scale-110 hover:border-primary/70",
                              getCellTone(day.count)
                            )}
                            style={{ height: CELL_SIZE, width: CELL_SIZE }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">{day.label}</p>
                          <p className="text-muted-foreground">{day.count} solved</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>Each square is one day from your first recorded solve onward.</p>
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 4, 6].map((count) => (
              <div
                key={count}
                className={cn("rounded-[4px] border", getCellTone(count))}
                style={{ height: CELL_SIZE, width: CELL_SIZE }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
