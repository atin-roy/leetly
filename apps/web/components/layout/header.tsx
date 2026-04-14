"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  BarChart3,
  BookOpen,
  Code2,
  List,
  LogOut,
  Menu,
  Palette,
  RotateCcw,
  StickyNote,
  UserCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "@/hooks/use-theme"
import { THEMES, type ThemeId } from "@/lib/themes"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/problems", label: "Problems", icon: Code2 },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/lists", label: "Lists", icon: List },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/account", label: "Account", icon: UserCircle2 },
]

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { themeId, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-20 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-16 max-w-[1500px] items-center gap-3 rounded-lg border border-border/75 bg-card/86 px-3 shadow-[0_16px_55px_color-mix(in_oklab,var(--foreground)_9%,transparent)] backdrop-blur-2xl">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3 pr-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-semibold tracking-tight">Leetly</p>
            <p className="truncate text-[11px] uppercase text-muted-foreground">Practice OS</p>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" title="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navItems.map(({ href, label, icon: Icon }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={themeId} onValueChange={(value) => setTheme(value as ThemeId)}>
            <SelectTrigger className="h-10 w-[166px] rounded-lg border-border/80 bg-background/70 shadow-sm max-sm:w-10 max-sm:px-2">
              <Palette className="h-4 w-4 text-muted-foreground sm:mr-1" />
              <span className="sr-only">Theme</span>
              <SelectValue placeholder="Theme" className="max-sm:hidden" />
            </SelectTrigger>
            <SelectContent align="end">
              {THEMES.map((theme) => (
                <SelectItem key={theme.id} value={theme.id}>
                  {theme.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {status === "loading" ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium">{session.user?.name}</p>
                  <p className="text-muted-foreground">{session.user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </header>
  )
}
