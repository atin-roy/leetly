"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { updateUserTheme } from "@/lib/api"
import { THEMES, THEME_STORAGE_KEY } from "@/lib/themes"

export function useTheme() {
  const { data: session } = useSession()
  const [themeId, setThemeIdState] = useState<string>(() => {
    if (typeof window === "undefined") return THEMES[0].id
    return localStorage.getItem(THEME_STORAGE_KEY) ?? THEMES[0].id
  })

  // Apply theme data attribute whenever themeId changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeId)
  }, [themeId])

  const setTheme = useCallback(
    (id: string) => {
      setThemeIdState(id)
      localStorage.setItem(THEME_STORAGE_KEY, id)

      // Also persist to backend if authenticated
      if (session?.accessToken) {
        const themeIndex = THEMES.findIndex((t) => t.id === id)
        if (themeIndex >= 0) {
          updateUserTheme(session.accessToken, themeIndex + 1).catch(() => {
            // Silently fail — localStorage is the primary store
          })
        }
      }
    },
    [session?.accessToken],
  )

  return { themeId, setTheme }
}
