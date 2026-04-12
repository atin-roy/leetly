"use client"

import { useEffect, useState } from "react"
import { THEMES, THEME_STORAGE_KEY, type ThemeId } from "@/lib/themes"

function readStoredTheme(): ThemeId {
  if (typeof window === "undefined") return THEMES[0].id

  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return (THEMES.find((theme) => theme.id === stored)?.id ?? THEMES[0].id) as ThemeId
}

export function useTheme() {
  const [themeId, setThemeIdState] = useState<ThemeId>(readStoredTheme)

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeId)
  }, [themeId])

  function setTheme(id: ThemeId) {
    setThemeIdState(id)

    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, id)
    }
  }

  return { themeId, setTheme }
}
