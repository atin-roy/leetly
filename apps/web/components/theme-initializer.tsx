"use client"

import { useEffect } from "react"
import { THEME_STORAGE_KEY } from "@/lib/themes"

export function ThemeInitializer() {
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) ?? "index"
    document.documentElement.setAttribute("data-theme", stored)
  }, [])

  return null
}
