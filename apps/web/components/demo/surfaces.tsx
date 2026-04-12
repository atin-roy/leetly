import type { CSSProperties, ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="display-type mt-2 text-4xl leading-none">{title}</h2>
        {description ? (
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

export function HeroPanel({
  eyebrow,
  title,
  description,
  kicker,
  action,
  aside,
  className,
}: {
  eyebrow: string
  title: string
  description: string
  kicker?: string
  action?: ReactNode
  aside?: ReactNode
  className?: string
}) {
  return (
    <section className={cn("panel-strong relative overflow-hidden p-8 md:p-10", className)}>
      <div className="absolute inset-0 pattern-dots opacity-35" />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)]">
        <div className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display-type mt-4 text-5xl leading-[0.95] md:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">{description}</p>
          {kicker ? (
            <div className="mt-6 inline-flex rounded-full border border-[var(--border-default)] bg-[var(--surface-card)] px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {kicker}
            </div>
          ) : null}
          {action ? <div className="mt-8 flex flex-wrap gap-3">{action}</div> : null}
        </div>
        {aside ? <div className="relative">{aside}</div> : null}
      </div>
    </section>
  )
}

export function StatTile({
  label,
  value,
  change,
  tone = "neutral",
}: {
  label: string
  value: string
  change: string
  tone?: "neutral" | "positive" | "warning"
}) {
  const toneClass =
    tone === "positive"
      ? "text-[var(--chart-3)]"
      : tone === "warning"
        ? "text-[var(--chart-4)]"
        : "text-[var(--text-muted)]"

  return (
    <Card className="gap-3 p-5">
      <CardHeader className="gap-1">
        <p className="eyebrow">{label}</p>
        <CardTitle className="text-4xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <p className={cn("text-sm", toneClass)}>{change}</p>
      </CardContent>
    </Card>
  )
}

export function MetricStrip({
  items,
}: {
  items: Array<{
    label: string
    value: string
    change: string
    tone?: "neutral" | "positive" | "warning"
  }>
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <StatTile key={item.label} {...item} />
      ))}
    </div>
  )
}

export function InsightCard({
  eyebrow,
  title,
  body,
  footnote,
}: {
  eyebrow: string
  title: string
  body: string
  footnote: string
}) {
  return (
    <Card className="h-full justify-between">
      <CardHeader className="gap-3">
        <Badge variant="secondary">{eyebrow}</Badge>
        <CardTitle className="text-3xl">{title}</CardTitle>
        <CardDescription>{body}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <ArrowUpRight className="size-4" />
          <span>{footnote}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function EmptyStateBlock({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="panel flex min-h-56 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="max-w-md">
        <p className="display-type text-3xl">{title}</p>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function MiniBars({
  data,
  className,
}: {
  data: Array<{ label: string; value: number }>
  className?: string
}) {
  const maxValue = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className={cn("grid gap-3", className)}>
      {data.map((item) => (
        <div key={item.label} className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
            {item.label}
          </span>
          <div className="h-2 rounded-full bg-[var(--surface-muted)]">
            <div
              className="h-2 rounded-full bg-[var(--accent-solid)]"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <span className="text-right text-sm text-[var(--text-secondary)]">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

export function ActivityStrip({
  items,
}: {
  items: Array<{ day: string; count: number }>
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => {
        const opacity = item.count === 0 ? 0.08 : 0.18 + item.count * 0.12
        const style = {
          backgroundColor: `color-mix(in oklab, var(--accent-solid) ${Math.min(opacity * 100, 78)}%, var(--surface-muted))`,
        } as CSSProperties

        return (
          <div key={`${item.day}-${index}`} className="space-y-1">
            <div
              className="size-10 rounded-[1rem] border border-[var(--border-default)] sm:size-11"
              style={style}
            />
            <p className="text-center font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {item.day}
            </p>
          </div>
        )
      })}
    </div>
  )
}
