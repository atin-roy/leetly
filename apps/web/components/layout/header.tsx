"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { BookOpen, LogOut, Menu, Palette, Sparkles } from "lucide-react"
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
import { useSidebar } from "./sidebar-context"

export function Header() {
  const { data: session, status } = useSession()
  const { toggle } = useSidebar()
  const { themeId, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-10 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-3 rounded-lg border border-border/75 bg-card/82 px-3 shadow-[0_16px_55px_color-mix(in_oklab,var(--foreground)_9%,transparent)] backdrop-blur-2xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="text-muted-foreground"
          title="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Leetly</span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/12 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">Training cockpit</p>
            <p className="truncate text-xs text-muted-foreground">
              Queue, review, notes, and progress in one pass.
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center justify-end gap-2">
          <Select value={themeId} onValueChange={(value) => setTheme(value as ThemeId)}>
            <SelectTrigger className="h-9 w-[166px] rounded-lg border-border/80 bg-background/70 shadow-sm max-sm:w-10 max-sm:px-2">
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
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
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
