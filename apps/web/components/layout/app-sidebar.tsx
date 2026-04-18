"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Code2,
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
        "flex h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar/92 text-sidebar-foreground shadow-[8px_0_30px_color-mix(in_oklab,var(--foreground)_8%,transparent)] backdrop-blur-xl transition-all duration-200",
        collapsed ? "w-14" : "w-56",
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border px-3",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <Link
          href="/dashboard"
          title={collapsed ? "Leetly" : undefined}
          className={cn(
            "flex min-w-0 items-center gap-2 font-black tracking-tight text-sidebar-foreground",
            collapsed && "justify-center",
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_8px_20px_color-mix(in_oklab,var(--sidebar-primary)_20%,transparent)]">
            <BookOpen className="h-4 w-4" />
          </span>
          {!collapsed && <span className="truncate text-lg">Leetly</span>}
        </Link>

        {!collapsed && (
          <button
            onClick={toggle}
            title="Collapse sidebar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-hidden p-3 pt-4">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_8px_20px_color-mix(in_oklab,var(--sidebar-primary)_20%,transparent)]"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t p-3 space-y-1">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center px-2",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        {collapsed && (
          <button
            onClick={toggle}
            title="Expand sidebar"
            className="flex w-full items-center justify-center gap-3 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronRight className="h-4 w-4 shrink-0" />
          </button>
        )}
      </div>
    </aside>
  )
}
