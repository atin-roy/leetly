"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Code2,
  Command,
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
        "relative z-20 flex min-h-svh self-stretch flex-col border-r border-sidebar-border bg-sidebar/95 text-sidebar-foreground shadow-[16px_0_50px_color-mix(in_oklab,var(--foreground)_8%,transparent)] backdrop-blur-xl transition-all duration-200",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", collapsed && "justify-center px-2")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
          <Command className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="ml-3 min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">Leetly</p>
            <p className="truncate text-[11px] uppercase text-sidebar-foreground/55">Practice OS</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 pt-5">
        {!collapsed && (
          <p className="mb-2 px-3 text-[11px] font-medium uppercase text-sidebar-foreground/45">Workspace</p>
        )}
        <ul className="space-y-1.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/68 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="space-y-1.5 border-t border-sidebar-border p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/65 transition-colors hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center px-2",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <button
          onClick={toggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2",
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
