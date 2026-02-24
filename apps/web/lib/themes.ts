export type ThemeId = "default" | "void" | "ember" | "arctic" | "dusk"

export interface Theme {
  id: ThemeId
  name: string
  description: string
  /** Colors used to render the mini preview swatch */
  preview: {
    bg: string
    sidebar: string
    card: string
    primary: string
    fg: string
    border: string
  }
}

export const THEMES: Theme[] = [
  {
    id: "default",
    name: "Default",
    description: "Clean neutral grayscale",
    preview: {
      bg: "oklch(1 0 0)",
      sidebar: "oklch(0.985 0 0)",
      card: "oklch(1 0 0)",
      primary: "oklch(0.205 0 0)",
      fg: "oklch(0.145 0 0)",
      border: "oklch(0.922 0 0)",
    },
  },
  {
    id: "void",
    name: "Void",
    description: "Dracula-inspired dark purple",
    preview: {
      bg: "oklch(0.19 0.035 285)",
      sidebar: "oklch(0.17 0.035 285)",
      card: "oklch(0.24 0.035 285)",
      primary: "oklch(0.73 0.26 333)",
      fg: "oklch(0.97 0.005 100)",
      border: "oklch(0.32 0.04 285)",
    },
  },
  {
    id: "ember",
    name: "Ember",
    description: "Dark charcoal with warm accents",
    preview: {
      bg: "oklch(0.20 0.008 95)",
      sidebar: "oklch(0.17 0.008 95)",
      card: "oklch(0.25 0.008 95)",
      primary: "oklch(0.73 0.19 58)",
      fg: "oklch(0.97 0.005 100)",
      border: "oklch(0.32 0.01 95)",
    },
  },
  {
    id: "arctic",
    name: "Arctic",
    description: "Nord-inspired cool blues",
    preview: {
      bg: "oklch(0.96 0.01 225)",
      sidebar: "oklch(0.24 0.035 255)",
      card: "oklch(0.93 0.015 225)",
      primary: "oklch(0.54 0.12 240)",
      fg: "oklch(0.24 0.035 255)",
      border: "oklch(0.85 0.015 225)",
    },
  },
  {
    id: "dusk",
    name: "Dusk",
    description: "Warm amber candlelight",
    preview: {
      bg: "oklch(0.17 0.03 65)",
      sidebar: "oklch(0.14 0.03 65)",
      card: "oklch(0.22 0.03 65)",
      primary: "oklch(0.78 0.18 65)",
      fg: "oklch(0.95 0.02 75)",
      border: "oklch(0.30 0.03 65)",
    },
  },
]

export const THEME_STORAGE_KEY = "leetly-theme"
