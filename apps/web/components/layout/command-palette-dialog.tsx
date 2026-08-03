"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Code2,
  List,
  RotateCcw,
  Search,
  StickyNote,
  UserCircle2,
  type LucideIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useProblemRefList } from "@/hooks/use-problems"
import styles from "./command-palette.module.css"

const ROUTES: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/problems", label: "Problems", icon: Code2 },
  { href: "/review", label: "Review queue", icon: RotateCcw },
  { href: "/lists", label: "My Lists", icon: List },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/account", label: "Account", icon: UserCircle2 },
]

/** How many problems to show at once. The list is ranked, so the tail is noise. */
const MAX_PROBLEM_RESULTS = 8

interface Item {
  key: string
  href: string
  label: string
  /** Rendered in the id column for problems; routes have none. */
  id?: number
  icon?: LucideIcon
  group: "Go to" | "Problems"
}

export function CommandPaletteDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const { data: problems } = useProblemRefList()
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const items = useMemo<Item[]>(() => {
    const needle = query.trim().toLowerCase()

    const routes = ROUTES.filter(
      (route) => !needle || route.label.toLowerCase().includes(needle),
    ).map<Item>((route) => ({
      key: `route:${route.href}`,
      href: route.href,
      label: route.label,
      icon: route.icon,
      group: "Go to",
    }))

    // Without a query the problem list would just be an arbitrary alphabetical
    // slice, which tells the user nothing. Show routes only until they type.
    if (!needle) return routes

    const matched = (problems ?? [])
      .map((ref) => {
        const title = ref.title.toLowerCase()
        const index = title.indexOf(needle)
        const idMatch = String(ref.leetcodeId).startsWith(needle)
        if (index === -1 && !idMatch) return null
        // Exact id, then title prefix, then anywhere in the title.
        const rank = idMatch ? 0 : index === 0 ? 1 : 2
        return { ref, rank }
      })
      .filter((match) => match !== null)
      .sort((a, b) => a.rank - b.rank || a.ref.title.localeCompare(b.ref.title))
      .slice(0, MAX_PROBLEM_RESULTS)
      .map<Item>(({ ref }) => ({
        key: `problem:${ref.id}`,
        href: `/problems/${ref.id}`,
        label: ref.title,
        id: ref.leetcodeId,
        group: "Problems",
      }))

    return [...routes, ...matched]
  }, [query, problems])

  // A stale index from the previous query would highlight the wrong row, or
  // none at all if the new result set is shorter — so the two always move
  // together, from the event rather than from an effect reacting to it.
  function handleQueryChange(value: string) {
    setQuery(value)
    setActiveIndex(0)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) handleQueryChange("")
    onOpenChange(nextOpen)
  }

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  function handleSelect(item: Item) {
    handleOpenChange(false)
    router.push(item.href)
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (items.length === 0) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % items.length)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + items.length) % items.length)
    } else if (event.key === "Enter") {
      event.preventDefault()
      const item = items[activeIndex]
      if (item) handleSelect(item)
    }
  }

  let lastGroup: Item["group"] | null = null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={styles.content} showCloseButton={false}>
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search problems or jump to a page.
        </DialogDescription>

        <div className={styles.field}>
          <Search size={16} className={styles.fieldIcon} aria-hidden="true" />
          <input
            autoFocus
            className={styles.input}
            placeholder="Search problems, or jump to a page…"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-results"
            aria-activedescendant={items[activeIndex]?.key}
            aria-autocomplete="list"
          />
          <kbd className={styles.hint}>esc</kbd>
        </div>

        <div
          id="command-palette-results"
          role="listbox"
          aria-label="Results"
          className={styles.results}
          ref={listRef}
        >
          {items.length === 0 ? (
            <p className={styles.empty}>No matches for “{query}”.</p>
          ) : (
            items.map((item, index) => {
              const showGroup = item.group !== lastGroup
              lastGroup = item.group
              const Icon = item.icon

              return (
                <div key={item.key}>
                  {showGroup && (
                    <p className={styles.groupLabel}>{item.group}</p>
                  )}
                  <button
                    type="button"
                    id={item.key}
                    role="option"
                    aria-selected={index === activeIndex}
                    data-active={index === activeIndex}
                    className={styles.item}
                    onMouseMove={() => setActiveIndex(index)}
                    onClick={() => handleSelect(item)}
                  >
                    {Icon && (
                      <Icon
                        size={16}
                        className={styles.itemIcon}
                        aria-hidden="true"
                      />
                    )}
                    {item.id !== undefined && (
                      <span className={styles.itemId}>{item.id}</span>
                    )}
                    <span className={styles.itemLabel}>{item.label}</span>
                  </button>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
