"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { updateUserTheme } from "@/lib/api"
import { THEMES, THEME_STORAGE_KEY, type ThemeId } from "@/lib/themes"

export function useTheme() {
  const { data: session } = useSession()
  const userKey = useMemo(() => session?.user?.email?.toLowerCase() ?? null, [session])

  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return THEMES[0].id
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return (THEMES.find((theme) => theme.id === stored)?.id ?? THEMES[0].id) as ThemeId
  })

  const effectiveThemeId: ThemeId =
    typeof window === "undefined"
      ? themeId
      : userKey
        ? ((THEMES.find(
            (theme) => theme.id === localStorage.getItem(`${THEME_STORAGE_KEY}:${userKey}`),
          )?.id ?? themeId) as ThemeId)
        : themeId

  // Apply theme data attribute whenever themeId changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", effectiveThemeId)
  }, [effectiveThemeId])

  function setTheme(id: ThemeId, options?: { persist?: boolean }) {
    setThemeIdState(id)

    if (typeof window !== "undefined") {
      // Keep legacy key for signed-out/default UX compatibility.
      localStorage.setItem(THEME_STORAGE_KEY, id)
      if (userKey) {
        localStorage.setItem(`${THEME_STORAGE_KEY}:${userKey}`, id)
      }
    }

    // Also persist to backend if authenticated unless explicitly skipped.
    if (options?.persist !== false && session?.accessToken) {
      const themeIndex = THEMES.findIndex((t) => t.id === id)
      if (themeIndex >= 0) {
        updateUserTheme(session.accessToken, themeIndex + 1).catch(() => {
          // Silently fail — localStorage still keeps the current user preference.
        })
      }
    }
  }

  return { themeId: effectiveThemeId, setTheme }
}
