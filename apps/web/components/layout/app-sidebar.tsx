"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  BarChart3,
  Code2,
  Command,
  GalleryVerticalEnd,
  List,
  LogOut,
  RotateCcw,
  StickyNote,
  UserCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-context"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/problems", label: "Problems", icon: Code2 },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/lists", label: "My Lists", icon: List },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/account", label: "Account", icon: UserCircle2 },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebar()

  return (
    <aside
      className={cn(
        "relative z-20 flex min-h-svh self-stretch shrink-0 p-3 text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-[92px]" : "w-[286px]",
      )}
    >
      <div className="sticky top-3 flex h-[calc(100svh-1.5rem)] flex-col overflow-hidden rounded-lg border border-sidebar-border/75 bg-sidebar/92 p-3 shadow-[0_24px_70px_color-mix(in_oklab,var(--foreground)_14%,transparent)] backdrop-blur-2xl">
        <div className={cn("flex items-center gap-3 rounded-lg bg-sidebar-accent/55 p-2", collapsed && "justify-center")}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <Command className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">Leetly</p>
              <p className="truncate text-[11px] uppercase text-sidebar-foreground/55">Practice OS</p>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="mt-4 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/35 p-3">
            <div className="flex items-center gap-2 text-xs font-medium uppercase text-sidebar-foreground/55">
              <GalleryVerticalEnd className="h-3.5 w-3.5" />
              Today
            </div>
            <p className="mt-2 text-sm font-semibold">Clear the next useful problem.</p>
            <p className="mt-1 text-xs leading-5 text-sidebar-foreground/58">
              Problems, notes, and review stay one move away.
            </p>
          </div>
        )}

        <nav className="mt-4 flex-1 overflow-y-auto">
          {!collapsed && (
            <p className="mb-2 px-2 text-[11px] font-medium uppercase text-sidebar-foreground/45">Workspace</p>
          )}
          <ul className="space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/")
              return (
                <li key={href}>
                  <Link
                    href={href}
                    title={collapsed ? label : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_12px_35px_color-mix(in_oklab,var(--sidebar-primary)_32%,transparent)]"
                        : "text-sidebar-foreground/66 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                    {!collapsed && active && <span className="ml-auto h-2 w-2 rounded-full bg-sidebar-primary-foreground/80" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="space-y-2 border-t border-sidebar-border/70 pt-3">
          <button
            onClick={toggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            <GalleryVerticalEnd className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Compact mode</span>}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            title={collapsed ? "Sign out" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-sidebar-foreground/65 transition-colors hover:bg-destructive/10 hover:text-destructive",
              collapsed && "justify-center px-2",
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
