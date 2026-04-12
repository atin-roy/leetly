import {
  BookMarked,
  ChartColumnBig,
  FileText,
  FolderKanban,
  House,
  RotateCcw,
  Settings2,
} from "lucide-react"

export const appNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: ChartColumnBig, meta: "Flagship overview" },
  { href: "/problems", label: "Problems", icon: BookMarked, meta: "Case-study workspace" },
  { href: "/review", label: "Review", icon: RotateCcw, meta: "Spaced repetition queue" },
  { href: "/lists", label: "Lists", icon: FolderKanban, meta: "Curated sets" },
  { href: "/notes", label: "Notes", icon: FileText, meta: "Editorial notebook" },
  { href: "/account", label: "Account", icon: Settings2, meta: "Profile and theme" },
] as const

export const publicNavItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const

export function getPageMeta(pathname: string) {
  if (pathname.startsWith("/problems/")) {
    return {
      title: "Problem Case Study",
      description: "Attempt history, note fragments, related patterns, and review context.",
    }
  }

  if (pathname.startsWith("/lists/")) {
    return {
      title: "List Detail",
      description: "A tighter reading of one focused problem set and its attached rationale.",
    }
  }

  const fromNav = appNavItems.find((item) => pathname === item.href)
  if (fromNav) {
    return {
      title: fromNav.label,
      description: fromNav.meta,
    }
  }

  return {
    title: "Leetly Demo",
    description: "Editorial-tech redesign branch.",
  }
}

export const homeLink = {
  href: "/",
  label: "Leetly",
  icon: House,
}
