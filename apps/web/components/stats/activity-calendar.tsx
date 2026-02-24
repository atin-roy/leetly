"use client"

import { useEffect, useRef } from "react"
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
const BAR_W = 10
const BAR_GAP = 3
const CHART_H = 120

export function ActivityBar() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { data: dailyStats, isLoading } = useDailyStats(DAYS)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [dailyStats])

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
  const totalWidth = data.length * (BAR_W + BAR_GAP) - BAR_GAP

  return (
    <div ref={scrollRef} className="overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
      <div style={{ width: totalWidth, minWidth: "100%" }}>
        {/* Bars */}
        <div
          className="flex items-end gap-[3px]"
          style={{ height: CHART_H }}
        >
          {data.map((d) => {
            const barH =
              d.count === 0 ? 2 : Math.max((d.count / maxCount) * CHART_H, 4)
            return (
              <Tooltip key={d.date}>
                <TooltipTrigger asChild>
                  <div
                    className="flex-none cursor-default"
                    style={{
                      width: BAR_W,
                      height: "100%",
                      display: "flex",
                      alignItems: "flex-end",
                    }}
                  >
                    <div
                      className={cn(
                        "w-full rounded-[2px] transition-opacity hover:opacity-80",
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
        <div className="mt-1.5 flex gap-[3px]">
          {data.map((d) => (
            <div
              key={d.date}
              className="flex-none text-[10px] leading-none text-muted-foreground"
              style={{ width: BAR_W }}
            >
              {d.dayOfMonth === 1 ? d.monthLabel : ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
