import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowUpRight, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { publicNavItems } from "@/components/layout/nav"
import { cn } from "@/lib/utils"

export function PublicShell({
  children,
  currentPath,
}: {
  children: ReactNode
  currentPath: string
}) {
  return (
    <div className="editorial-shell min-h-svh">
      <header className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[color:color-mix(in_oklab,var(--bg-canvas)_88%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--text-primary)] text-[var(--bg-canvas)]">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="eyebrow">Leetly</p>
              <p className="display-type text-2xl">Editorial Demo</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-colors",
                  currentPath === item.href
                    ? "bg-[var(--surface-card)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-accent)] hover:text-[var(--text-primary)]",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Button size="sm" asChild>
            <Link href="/dashboard">
              Enter Demo
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto flex max-w-7xl flex-col gap-12 px-5 py-8 md:px-8 md:py-10">
        {children}
      </main>
    </div>
  )
}
