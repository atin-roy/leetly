"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Code2,
  List,
  Menu,
  RotateCcw,
  StickyNote,
  UserCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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

function NavList({
  collapsed,
  mobile = false,
  pathname,
}: {
  collapsed: boolean
  mobile?: boolean
  pathname: string
}) {
  return (
    <ul className="space-y-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/")
        return (
          <li key={href}>
            <Link
              href={href}
              title={!mobile && collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_8px_20px_color-mix(in_oklab,var(--sidebar-primary)_20%,transparent)]"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                !mobile && collapsed && "justify-center px-2",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {(mobile || !collapsed) && label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { collapsed, mobileOpen, toggle, toggleMobile, closeMobile, setMobileOpen } = useSidebar()

  useEffect(() => {
    closeMobile()
  }, [pathname, closeMobile])

  return (
    <>
      <div className="border-b border-sidebar-border/70 bg-sidebar/90 px-3 py-3 text-sidebar-foreground shadow-[0_10px_30px_-24px_color-mix(in_oklab,var(--foreground)_18%,transparent)] backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-2 font-black tracking-tight text-sidebar-foreground"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_8px_20px_color-mix(in_oklab,var(--sidebar-primary)_20%,transparent)]">
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="truncate text-lg">Leetly</span>
          </Link>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleMobile}
            className="rounded-xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-[86vw] max-w-[22rem] border-sidebar-border bg-sidebar/96 p-0 text-sidebar-foreground"
        >
          <SheetHeader className="border-b border-sidebar-border px-4 py-4 text-left">
            <SheetTitle className="flex items-center gap-2 text-sidebar-foreground">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_8px_20px_color-mix(in_oklab,var(--sidebar-primary)_20%,transparent)]">
                <BookOpen className="h-4 w-4" />
              </span>
              <span className="text-lg font-black tracking-tight">Leetly</span>
            </SheetTitle>
            <SheetDescription className="text-sidebar-foreground/70">
              Move between dashboard, backlog, review, notes, and account.
            </SheetDescription>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto p-4">
            <NavList mobile collapsed={collapsed} pathname={pathname} />
          </nav>
        </SheetContent>
      </Sheet>

      <aside
        className={cn(
          "hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar/92 text-sidebar-foreground shadow-[8px_0_30px_color-mix(in_oklab,var(--foreground)_8%,transparent)] backdrop-blur-xl transition-all duration-200 md:flex",
          collapsed ? "w-14" : "w-56",
        )}
      >
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-sidebar-border px-3",
            collapsed ? "justify-center" : "justify-start",
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
        </div>

        <nav className="flex-1 overflow-hidden p-3 pt-4">
          <NavList collapsed={collapsed} pathname={pathname} />
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={toggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronLeft className="h-4 w-4 shrink-0" />
            )}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
