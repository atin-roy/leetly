"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { appNavItems, getPageMeta } from "@/components/layout/nav"
import { getDemoSession } from "@/lib/demo-data"

export function Header() {
  const pathname = usePathname()
  const session = getDemoSession()
  const page = getPageMeta(pathname)

  return (
    <header className="panel flex flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
      <div>
        <p className="eyebrow">Demo Mode</p>
        <h1 className="display-type mt-2 text-4xl">{page.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{page.description}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-full border border-[var(--border-default)] bg-[var(--surface-card)] px-4 py-2 text-sm text-[var(--text-secondary)] sm:block">
          {session.streak}-day streak
        </div>
        <div className="rounded-full border border-[var(--border-default)] bg-[var(--surface-card)] px-4 py-2 text-right">
          <p className="text-sm font-semibold text-[var(--text-primary)]">{session.name}</p>
          <p className="text-xs text-[var(--text-muted)]">{session.email}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon-sm" className="md:hidden">
              <Menu className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {appNavItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href}>{item.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
