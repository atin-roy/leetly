export type ThemeId = "index" | "paper-signal" | "night-grid"

export interface Theme {
  id: ThemeId
  name: string
  description: string
  typography: {
    display: string
    body: string
    mono: string
  }
  preview: {
    surface: string
    panel: string
    accent: string
    text: string
    gradient: string
  }
}

export const THEMES: Theme[] = [
  {
    id: "index",
    name: "Index",
    description: "Plum-noir flagship with inked violets and electric magenta lift.",
    typography: {
      display: "Fraunces",
      body: "Manrope",
      mono: "IBM Plex Mono",
    },
    preview: {
      surface: "oklch(0.2 0.03 295)",
      panel: "oklch(0.25 0.028 292)",
      accent: "oklch(0.74 0.2 338)",
      text: "oklch(0.93 0.01 300)",
      gradient: "linear-gradient(135deg, oklch(0.34 0.08 282), oklch(0.74 0.2 338))",
    },
  },
  {
    id: "paper-signal",
    name: "Paper Signal",
    description: "Warm amber terminal with moss shadows and heat-map highlights.",
    typography: {
      display: "Fraunces",
      body: "Manrope",
      mono: "IBM Plex Mono",
    },
    preview: {
      surface: "oklch(0.24 0.02 90)",
      panel: "oklch(0.29 0.022 92)",
      accent: "oklch(0.78 0.15 80)",
      text: "oklch(0.9 0.02 90)",
      gradient: "linear-gradient(135deg, oklch(0.34 0.05 145), oklch(0.78 0.15 80))",
    },
  },
  {
    id: "night-grid",
    name: "Night Grid",
    description: "Midnight-cyan grid with deep ocean blues and bright terminal edges.",
    typography: {
      display: "Fraunces",
      body: "Manrope",
      mono: "IBM Plex Mono",
    },
    preview: {
      surface: "oklch(0.18 0.03 252)",
      panel: "oklch(0.23 0.03 245)",
      accent: "oklch(0.77 0.14 205)",
      text: "oklch(0.92 0.02 230)",
      gradient: "linear-gradient(135deg, oklch(0.29 0.08 250), oklch(0.77 0.14 205))",
    },
  },
]

export const THEME_STORAGE_KEY = "leetly-theme"
