"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Sparkles } from "lucide-react"
import { ThemeSwitcher } from "@/components/demo/theme-switcher"
import { appNavItems } from "@/components/layout/nav"
import { getDemoSession } from "@/lib/demo-data"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const pathname = usePathname()
  const session = getDemoSession()

  return (
    <aside className="panel hidden min-h-[calc(100svh-1.5rem)] flex-col justify-between p-4 md:flex">
      <div className="space-y-6">
        <div className="rounded-[1.8rem] border border-[var(--border-default)] bg-[var(--surface-card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--text-primary)] text-[var(--bg-canvas)]">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="eyebrow">Leetly</p>
              <p className="display-type text-3xl">Index</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
            Demo mode is active. Auth is bypassed and every route reads from the same stable mock source.
          </p>
        </div>

        <nav className="space-y-2">
          {appNavItems.map(({ href, label, icon: Icon, meta }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-[1.4rem] border px-4 py-3 transition-all",
                  active
                    ? "border-[var(--border-strong)] bg-[var(--surface-card)] shadow-[var(--shadow-soft)]"
                    : "border-transparent text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:bg-[var(--surface-accent)]",
                )}
              >
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--surface-muted)]">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
                  <p className="text-xs text-[var(--text-muted)]">{meta}</p>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="space-y-4">
        <ThemeSwitcher />
        <div className="rounded-[1.6rem] border border-[var(--border-default)] bg-[var(--surface-card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--surface-accent)]">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">{session.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{session.role}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Focus: {session.focus}
          </p>
        </div>
      </div>
    </aside>
  )
}
