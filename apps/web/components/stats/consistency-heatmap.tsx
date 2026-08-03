"use client"

import { useEffect, useRef, useState } from "react"
import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfWeek,
} from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDailyStats } from "@/hooks/use-stats"
import styles from "./consistency-heatmap.module.css"

const MIN_CELL_SIZE = 16
const MAX_CELL_SIZE = 48
const CELL_GAP = 4
const LABEL_COLUMN_W = 26
const WEEKDAY_ROWS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

function toneClass(count: number) {
  if (count <= 0) return styles.tone0
  if (count === 1) return styles.tone1
  if (count <= 3) return styles.tone2
  if (count <= 5) return styles.tone3
  return styles.tone4
}

export function ConsistencyHeatmap() {
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
    return <Skeleton className={styles.skeleton} />
  }

  const firstSolvedStat = dailyStats?.find((stat) => stat.solved > 0)

  if (!firstSolvedStat) {
    return <div className={styles.placeholder}>No solved activity yet.</div>
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

  const weekCount =
    dates.length > 0 ? Math.max(...dates.map((day) => day.weekIndex)) + 1 : 1

  // Keyed by week*7+weekday so the render loop is a lookup, not a linear scan
  // per cell — the previous `dates.find` made a two-year grid quadratic.
  const bySlot = new Map(
    dates.map((day) => [day.weekIndex * 7 + day.weekdayIndex, day]),
  )

  const monthMarkers = Array.from({ length: weekCount }, (_, weekIndex) => {
    const marker = dates.find(
      (day) => day.weekIndex === weekIndex && day.dayOfMonth <= 7,
    )
    if (!marker) {
      return ""
    }

    const previousMarker = dates.find(
      (day) => day.weekIndex === weekIndex - 1 && day.dayOfMonth <= 7,
    )
    return previousMarker?.monthLabel === marker.monthLabel ? "" : marker.monthLabel
  })

  const availableWidth = Math.max(
    (containerWidth ?? 0) - LABEL_COLUMN_W - 12,
    MIN_CELL_SIZE,
  )
  const computedCellSize =
    containerWidth === null
      ? 24
      : Math.floor(
          (availableWidth - Math.max(weekCount - 1, 0) * CELL_GAP) /
            Math.max(weekCount, 1),
        )
  const cellSize = Math.max(
    MIN_CELL_SIZE,
    Math.min(MAX_CELL_SIZE, computedCellSize),
  )
  const chartWidth = weekCount * cellSize + Math.max(weekCount - 1, 0) * CELL_GAP

  return (
    <div className={styles.wrap}>
      <div ref={containerRef} className={styles.frame}>
        <div className={styles.grid}>
          <div
            className={styles.weekdays}
            style={{
              width: LABEL_COLUMN_W,
              gap: CELL_GAP,
              gridTemplateRows: `repeat(7, ${cellSize}px)`,
            }}
          >
            {WEEKDAY_ROWS.map((label, index) => (
              <div key={label} className={styles.weekday}>
                {index % 2 === 0 ? label : ""}
              </div>
            ))}
          </div>

          <div className={styles.columns}>
            <div
              className={styles.months}
              style={{
                columnGap: CELL_GAP,
                gridTemplateColumns: `repeat(${weekCount}, ${cellSize}px)`,
                width: chartWidth,
              }}
            >
              {monthMarkers.map((label, index) => (
                <div key={`${label}-${index}`}>{label}</div>
              ))}
            </div>

            <div
              className={styles.cells}
              style={{
                columnGap: CELL_GAP,
                rowGap: CELL_GAP,
                gridTemplateColumns: `repeat(${weekCount}, ${cellSize}px)`,
                gridTemplateRows: `repeat(7, ${cellSize}px)`,
                width: chartWidth,
              }}
            >
              {Array.from({ length: weekCount * 7 }, (_, index) => {
                const weekIndex = Math.floor(index / 7)
                const weekdayIndex = index % 7
                const day = bySlot.get(weekIndex * 7 + weekdayIndex)

                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      style={{ height: cellSize, width: cellSize }}
                    />
                  )
                }

                return (
                  <Tooltip key={day.date}>
                    <TooltipTrigger asChild>
                      <div
                        className={`${styles.cell} ${toneClass(day.count)}`}
                        style={{ height: cellSize, width: cellSize }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{day.label}</p>
                      <p>{day.count} solved</p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.legend}>
        <p>Each square is one day since your first solve.</p>
        <div className={styles.scale}>
          <span>Less</span>
          <div className={styles.swatches}>
            {[0, 1, 2, 4, 6].map((count) => (
              <div
                key={count}
                className={`${styles.swatch} ${toneClass(count)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
