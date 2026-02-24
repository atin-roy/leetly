"use client"

import { useEffect } from "react"
import { THEME_STORAGE_KEY, type ThemeId } from "@/lib/themes"

/** Reads saved theme from localStorage and applies it before first paint. */
export function ThemeInitializer() {
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null
    if (stored && stored !== "default") {
      document.documentElement.setAttribute("data-theme", stored)
    }
  }, [])

  return null
}
