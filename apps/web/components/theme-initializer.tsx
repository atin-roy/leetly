"use client"

import { useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { getUserSettings } from "@/lib/api"
import { THEMES, THEME_STORAGE_KEY, type ThemeId } from "@/lib/themes"

/*
 * Resolves which theme this user should see, after hydration.
 *
 * The pre-paint work is done by the inline script in app/layout.tsx, which can
 * only read the global key because it runs before the session is known. This
 * component's job is to reconcile that guess with the per-user preference, and
 * — importantly — to write the result back to the global key so the next load's
 * inline script guesses right and there is nothing to correct.
 */
export function ThemeInitializer() {
  const { session } = useAuth()

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
        // Without this the global key stays unset on a fresh device, so the
        // inline script falls back to the default theme on every subsequent
        // load and the correct one only appears once this request returns.
        localStorage.setItem(THEME_STORAGE_KEY, resolved)
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
