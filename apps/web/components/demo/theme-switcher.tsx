"use client"

import { MonitorCog } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"
import { THEMES } from "@/lib/themes"
import { cn } from "@/lib/utils"

export function ThemeSwitcher({ className }: { className?: string }) {
  const { themeId, setTheme } = useTheme()

  return (
    <div className={cn("panel flex flex-col gap-3 p-4", className)}>
      <div className="flex items-center gap-2">
        <MonitorCog className="size-4 text-[var(--text-muted)]" />
        <div>
          <p className="eyebrow">Theme</p>
          <p className="text-sm text-[var(--text-secondary)]">Local demo persistence only</p>
        </div>
      </div>
      <div className="grid gap-2">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => setTheme(theme.id)}
            className={cn(
              "flex items-center justify-between rounded-[1.35rem] border px-3 py-3 text-left transition-all",
              themeId === theme.id
                ? "border-[var(--border-strong)] bg-[var(--surface-card)] shadow-[var(--shadow-soft)]"
                : "border-[var(--border-default)] bg-transparent hover:bg-[var(--surface-accent)]",
            )}
          >
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{theme.name}</p>
            </div>
            <div
              className="h-10 w-14 rounded-2xl border border-white/20"
              style={{ background: theme.preview.gradient }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
