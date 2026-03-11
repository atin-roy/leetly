"use client"

import { useEffect, useRef, useState } from "react"
import { format, subDays } from "date-fns"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { useDailyStats } from "@/hooks/use-stats"

const DAYS = 90
const MIN_BAR_W = 12
const BAR_GAP = 3
const CHART_H = 132

export function ActivityBar() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)
  const { data: dailyStats, isLoading } = useDailyStats(DAYS)

  useEffect(() => {
    const node = containerRef.current
    if (!node) {
      return
    }

    const updateWidth = () => {
      setContainerWidth(node.clientWidth)
    }

    updateWidth()

    const observer = new ResizeObserver(() => {
      updateWidth()
    })

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [])

  if (isLoading) {
    return <Skeleton className="h-[140px] w-full" />
  }

  // Build a date map for quick lookups
  const countsMap = new Map<string, number>()
  if (dailyStats) {
    for (const stat of dailyStats) {
      countsMap.set(stat.date, stat.solved)
    }
  }

  const today = new Date()
  const data = Array.from({ length: DAYS }, (_, i) => {
    const date = subDays(today, DAYS - 1 - i)
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
  const visibleBars = containerWidth
    ? Math.max(1, Math.floor((containerWidth + BAR_GAP) / (MIN_BAR_W + BAR_GAP)))
    : DAYS
  const visibleData = data.slice(-Math.min(DAYS, visibleBars))

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <div className="w-full">
        {/* Bars */}
        <div
          className="grid items-end gap-[3px]"
          style={{
            height: CHART_H,
            gridTemplateColumns: `repeat(${visibleData.length}, minmax(0, 1fr))`,
          }}
        >
          {visibleData.map((d) => {
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
          className="mt-1.5 grid gap-[3px]"
          style={{
            gridTemplateColumns: `repeat(${visibleData.length}, minmax(0, 1fr))`,
          }}
        >
          {visibleData.map((d) => (
            <div
              key={d.date}
              className="min-w-0 text-[10px] leading-none text-muted-foreground"
            >
              {d.dayOfMonth === 1 ? d.monthLabel : ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
