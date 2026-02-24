"use client"

import { useEffect, useRef } from "react"
import { format, subDays } from "date-fns"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const DAYS = 90
const BAR_W = 10
const BAR_GAP = 3
const CHART_H = 120

// TODO: replace with real data from useDailyStats(DAYS)
const SEED = [
  0, 2, 0, 1, 3, 0, 0, 2, 1, 0, 4, 2, 0, 3, 1, 0, 0, 2, 5, 1, 0, 3, 0, 2, 1,
  0, 0, 4, 2, 1, 8, 0, 2, 1, 0, 3, 0, 1, 2, 0, 0, 3, 1, 2, 0, 0, 1, 3, 0, 2,
  1, 0, 4, 0, 1, 2, 3, 0, 0, 2, 1, 0, 3, 2, 0, 1, 0, 2, 0, 1, 3, 1, 0, 2, 0,
  4, 1, 0, 2, 3, 0, 1, 2, 0, 0, 3, 1, 2, 0, 0,
]

function buildData() {
  const today = new Date()
  return Array.from({ length: DAYS }, (_, i) => {
    const date = subDays(today, DAYS - 1 - i)
    return {
      date: format(date, "yyyy-MM-dd"),
      label: format(date, "MMM d"),
      monthLabel: format(date, "MMM"),
      dayOfMonth: date.getDate(),
      count: SEED[i] ?? 0,
    }
  })
}

const DATA = buildData()

export function ActivityBar() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const maxCount = Math.max(...DATA.map((d) => d.count), 1)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [])

  const totalWidth = DATA.length * (BAR_W + BAR_GAP) - BAR_GAP

  return (
    <div ref={scrollRef} className="overflow-x-auto">
      <div style={{ width: totalWidth, minWidth: "100%" }}>
        {/* Bars */}
        <div
          className="flex items-end gap-[3px]"
          style={{ height: CHART_H }}
        >
          {DATA.map((d) => {
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
          {DATA.map((d) => (
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
