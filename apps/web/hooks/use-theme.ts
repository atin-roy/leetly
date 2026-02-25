"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { updateUserTheme } from "@/lib/api"
import { THEMES, THEME_STORAGE_KEY } from "@/lib/themes"

export function useTheme() {
  const { data: session } = useSession()
  const userKey = useMemo(() => session?.user?.email?.toLowerCase() ?? null, [session])

  const [themeId, setThemeIdState] = useState<string>(() => {
    if (typeof window === "undefined") return THEMES[0].id
    return localStorage.getItem(THEME_STORAGE_KEY) ?? THEMES[0].id
  })

  const effectiveThemeId =
    typeof window === "undefined"
      ? themeId
      : userKey
        ? localStorage.getItem(`${THEME_STORAGE_KEY}:${userKey}`) ?? themeId
        : themeId

  // Apply theme data attribute whenever themeId changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", effectiveThemeId)
  }, [effectiveThemeId])

  function setTheme(id: string) {
    setThemeIdState(id)

    if (typeof window !== "undefined") {
      // Keep legacy key for signed-out/default UX compatibility.
      localStorage.setItem(THEME_STORAGE_KEY, id)
      if (userKey) {
        localStorage.setItem(`${THEME_STORAGE_KEY}:${userKey}`, id)
      }
    }

    // Also persist to backend if authenticated.
    if (session?.accessToken) {
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
