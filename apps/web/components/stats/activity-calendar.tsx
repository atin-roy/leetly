"use client"

import { useEffect, useRef, useState } from "react"
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { useDailyStats } from "@/hooks/use-stats"

const CHART_H = 152
const MAX_BAR_GAP = 3

export function ActivityBar() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)
  const { data: dailyStats, isLoading } = useDailyStats()

  useEffect(() => {
    const node = containerRef.current
    if (!node) {
      return
    }

    const updateWidth = () => {
      setContainerWidth(node.clientWidth)
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [])

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

  // Build a date map for quick lookups
  const countsMap = new Map<string, number>()
  if (dailyStats) {
    for (const stat of dailyStats) {
      countsMap.set(stat.date, stat.solved)
    }
  }

  const today = new Date()
  const startDate = parseISO(firstSolvedStat.date)
  const totalDays = Math.max(differenceInCalendarDays(today, startDate) + 1, 1)
  const data = Array.from({ length: totalDays }, (_, i) => {
    const date = addDays(startDate, i)
    const dateStr = format(date, "yyyy-MM-dd")
    return {
      date: dateStr,
      label: format(date, "MMM d"),
      monthLabel: format(date, "MMM"),
      dayOfMonth: date.getDate(),
      count: countsMap.get(dateStr) ?? 0,
    }
  })

  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const barGap =
    containerWidth === null || data.length <= 1
      ? MAX_BAR_GAP
      : Math.max(
          0,
          Math.min(MAX_BAR_GAP, (containerWidth - data.length) / (data.length - 1))
        )

  return (
    <div
      ref={containerRef}
      className="flex h-[180px] w-full flex-col justify-between overflow-hidden"
    >
      <div className="w-full">
        {/* Bars */}
        <div
          className="grid items-end"
          style={{
            height: CHART_H,
            columnGap: barGap,
            gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`,
          }}
        >
          {data.map((d) => {
            const barH =
              d.count === 0 ? 2 : Math.max((d.count / maxCount) * CHART_H, 4)
            return (
              <Tooltip key={d.date}>
                <TooltipTrigger asChild>
                  <div
                    className="flex h-full min-w-0 cursor-default items-end"
                  >
                    <div
                      className={cn(
                        "w-full rounded-[3px] transition-opacity hover:opacity-80",
                        d.count === 0
                          ? "bg-muted"
                          : d.count <= 2
                            ? "bg-primary/40"
                            : d.count <= 5
                              ? "bg-primary/70"
                              : "bg-primary"
                      )}
                      style={{ height: barH }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-medium">{d.label}</p>
                  <p className="text-muted-foreground">{d.count} solved</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        {/* Month labels */}
        <div
          className="mt-1.5 grid"
          style={{
            columnGap: barGap,
            gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`,
          }}
        >
          {data.map((d, index) => (
            <div
              key={d.date}
              className="min-w-0 text-[10px] leading-none text-muted-foreground"
            >
              {index === 0 || d.dayOfMonth === 1 ? d.monthLabel : ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
