"use client"

import { addDays, differenceInCalendarDays, format, parseISO, startOfWeek } from "date-fns"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { useDailyStats } from "@/hooks/use-stats"
import { cn } from "@/lib/utils"

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

function getCellTone(count: number) {
  if (count <= 0) return "bg-muted/55"
  if (count === 1) return "bg-primary/35"
  if (count <= 3) return "bg-primary/55"
  if (count <= 5) return "bg-primary/75"
  return "bg-primary"
}

export function ConsistencyHeatmap() {
  const { data: dailyStats, isLoading } = useDailyStats()

  if (isLoading) {
    return <Skeleton className="h-[180px] w-full rounded-2xl" />
  }

  const firstSolvedStat = dailyStats?.find((stat) => stat.solved > 0)

  if (!firstSolvedStat) {
    return (
      <div className="flex h-[180px] items-center text-sm text-muted-foreground">
        No solved activity yet.
      </div>
    )
  }

  const today = new Date()
  const startDate = parseISO(firstSolvedStat.date)
  const totalDays = Math.max(differenceInCalendarDays(today, startDate) + 1, 1)
  const rangeStart = startOfWeek(startDate)
  const countsMap = new Map<string, number>()

  for (const stat of dailyStats ?? []) {
    countsMap.set(stat.date, stat.solved)
  }

  const cells = Array.from({ length: totalDays }, (_, index) => {
    const date = addDays(startDate, index)
    const dateStr = format(date, "yyyy-MM-dd")
    return {
      date: dateStr,
      label: format(date, "MMM d, yyyy"),
      count: countsMap.get(dateStr) ?? 0,
      weekIndex: Math.floor(differenceInCalendarDays(date, rangeStart) / 7),
      weekdayIndex: date.getDay(),
      monthLabel: format(date, "MMM"),
      dayOfMonth: date.getDate(),
    }
  })

  const totalWeeks = cells.length > 0 ? Math.max(...cells.map((cell) => cell.weekIndex)) + 1 : 1

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-1">
        <div
          className="grid min-w-fit gap-x-2 gap-y-1"
          style={{
            gridTemplateColumns: `28px repeat(${totalWeeks}, minmax(12px, 1fr))`,
            gridTemplateRows: "18px repeat(7, 12px)",
          }}
        >
          <div />
          {Array.from({ length: totalWeeks }, (_, weekIndex) => {
            const monthMarker = cells.find(
              (cell) => cell.weekIndex === weekIndex && cell.dayOfMonth <= 7
            )
            return (
              <div
                key={`month-${weekIndex}`}
                className="text-[10px] leading-none text-muted-foreground"
              >
                {monthMarker ? monthMarker.monthLabel : ""}
              </div>
            )
          })}

          {WEEKDAY_LABELS.map((label, weekdayIndex) => (
            <div
              key={label + weekdayIndex}
              className="flex h-3 items-center text-[10px] leading-none text-muted-foreground"
            >
              {label}
            </div>
          ))}

          {WEEKDAY_LABELS.map((_, weekdayIndex) =>
            Array.from({ length: totalWeeks }, (_, weekIndex) => {
              const cell = cells.find(
                (entry) =>
                  entry.weekIndex === weekIndex && entry.weekdayIndex === weekdayIndex
              )

              if (!cell) {
                return <div key={`empty-${weekIndex}-${weekdayIndex}`} />
              }

              return (
                <Tooltip key={cell.date}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "h-3 w-3 rounded-[4px] border border-border/50 transition-transform hover:scale-110",
                        getCellTone(cell.count)
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p className="font-medium">{cell.label}</p>
                    <p className="text-muted-foreground">{cell.count} solved</p>
                  </TooltipContent>
                </Tooltip>
              )
            })
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>Each square is one day from your first solved problem onward.</p>
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 4, 6].map((count) => (
              <div
                key={count}
                className={cn("h-3 w-3 rounded-[4px] border border-border/50", getCellTone(count))}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
