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
  Search,
  StickyNote,
  UserCircle2,
  Users,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import styles from "./sidebar.module.css"
import { useCommandPalette } from "./command-palette"
import { useSidebar } from "./sidebar-context"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/problems", label: "Problems", icon: Code2 },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/lists", label: "My Lists", icon: List },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/people", label: "People", icon: Users },
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
  const railCollapsed = !mobile && collapsed

  return (
    <ul className={styles.navList}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/")
        return (
          <li key={href}>
            <Link
              href={href}
              title={railCollapsed ? label : undefined}
              data-active={active}
              className={`${styles.navLink} ${railCollapsed ? styles.collapsedLink : ""}`}
            >
              <Icon size={16} className={styles.navIcon} aria-hidden="true" />
              {!railCollapsed && label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function SearchTrigger({ collapsed }: { collapsed: boolean }) {
  const { open } = useCommandPalette()

  return (
    <button
      type="button"
      onClick={open}
      title={collapsed ? "Search" : undefined}
      className={`${styles.searchTrigger} ${collapsed ? styles.collapsedLink : ""}`}
    >
      <Search size={16} className={styles.navIcon} aria-hidden="true" />
      {!collapsed && (
        <>
          <span>Search</span>
          <kbd className={styles.searchHint}>⌘K</kbd>
        </>
      )}
    </button>
  )
}

function Wordmark({ showName }: { showName: boolean }) {
  return (
    <>
      <span className={styles.brandMark}>
        <BookOpen size={15} aria-hidden="true" />
      </span>
      {showName && <span className={styles.brandName}>Leetly</span>}
    </>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { collapsed, mobileOpen, toggle, toggleMobile, closeMobile, setMobileOpen } =
    useSidebar()

  useEffect(() => {
    closeMobile()
  }, [pathname, closeMobile])

  return (
    <>
      <div className={styles.mobileBar}>
        <div className={styles.mobileBarInner}>
          <Link href="/dashboard" className={styles.brand}>
            <Wordmark showName />
          </Link>

          <button
            type="button"
            onClick={toggleMobile}
            className={styles.menuButton}
            aria-label="Open navigation"
          >
            <Menu size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className={styles.sheetPanel}>
          <SheetHeader className={styles.sheetHeader}>
            <SheetTitle className={styles.sheetTitle}>
              <Wordmark showName />
            </SheetTitle>
            <SheetDescription className={styles.sheetDescription}>
              Move between dashboard, problems, review, notes, people, and account.
            </SheetDescription>
          </SheetHeader>

          <nav className={styles.sheetNav}>
            <SearchTrigger collapsed={false} />
            <NavList mobile collapsed={collapsed} pathname={pathname} />
          </nav>
        </SheetContent>
      </Sheet>

      <aside
        className={`${styles.rail} ${collapsed ? styles.railCollapsed : styles.railExpanded}`}
      >
        <div
          className={`${styles.railHead} ${collapsed ? styles.railHeadCollapsed : ""}`}
        >
          <Link
            href="/dashboard"
            title={collapsed ? "Leetly" : undefined}
            className={styles.brand}
          >
            <Wordmark showName={!collapsed} />
          </Link>
        </div>

        <nav className={styles.railNav}>
          <SearchTrigger collapsed={collapsed} />
          <NavList collapsed={collapsed} pathname={pathname} />
        </nav>

        <div className={styles.railFoot}>
          <button
            type="button"
            onClick={toggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`${styles.collapseButton} ${collapsed ? styles.collapsedLink : ""}`}
          >
            {collapsed ? (
              <ChevronRight size={16} aria-hidden="true" />
            ) : (
              <ChevronLeft size={16} aria-hidden="true" />
            )}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
