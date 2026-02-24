"use client"

import { useCallback, useEffect, useState } from "react"
import { THEME_STORAGE_KEY, type ThemeId } from "@/lib/themes"

function applyTheme(id: ThemeId) {
  const root = document.documentElement
  if (id === "default") {
    root.removeAttribute("data-theme")
  } else {
    root.setAttribute("data-theme", id)
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>("default")

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null
    if (stored) {
      setThemeState(stored)
      applyTheme(stored)
    }
  }, [])

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id)
    localStorage.setItem(THEME_STORAGE_KEY, id)
    applyTheme(id)
  }, [])

  return { theme, setTheme }
}
