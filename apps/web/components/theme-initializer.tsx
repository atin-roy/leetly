"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { getUserSettings } from "@/lib/api"
import { THEMES, THEME_STORAGE_KEY, type ThemeId } from "@/lib/themes"

/** Reads saved theme from localStorage and applies it before first paint. */
export function ThemeInitializer() {
  const { data: session } = useSession()

  useEffect(() => {
    const userKey = session?.user?.email?.toLowerCase() ?? null
    const legacyStored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null

    // Signed-out experience can keep using the legacy global key.
    if (!session?.accessToken || !userKey) {
      if (legacyStored && legacyStored !== "default") {
        document.documentElement.setAttribute("data-theme", legacyStored)
      } else {
        document.documentElement.setAttribute("data-theme", "default")
      }
      return
    }

    const perUserStorageKey = `${THEME_STORAGE_KEY}:${userKey}`
    const perUserStored = localStorage.getItem(perUserStorageKey) as ThemeId | null

    if (perUserStored) {
      document.documentElement.setAttribute("data-theme", perUserStored)
      return
    }

    // One-time migration path from legacy global key to per-user key.
    if (legacyStored) {
      localStorage.setItem(perUserStorageKey, legacyStored)
      document.documentElement.setAttribute("data-theme", legacyStored)
      return
    }

    // Fresh device/browser: hydrate from persisted backend settings.
    let cancelled = false
    getUserSettings(session.accessToken)
      .then((settings) => {
        if (cancelled) return
        const themeId = settings.themeId
        const resolved =
          themeId && themeId > 0 && themeId <= THEMES.length
            ? THEMES[themeId - 1].id
            : "default"
        localStorage.setItem(perUserStorageKey, resolved)
        document.documentElement.setAttribute("data-theme", resolved)
      })
      .catch(() => {
        if (!cancelled) {
          document.documentElement.setAttribute("data-theme", "default")
        }
      })

    return () => {
      cancelled = true
    }
  }, [session])

  return null
}
