export type ThemeId =
  | "default"
  | "void"
  | "ember"
  | "arctic"
  | "dusk"
  | "forest"
  | "signal"
  | "paper"
  | "lagoon"
  | "sunset"
  | "graphite"
  | "rose"

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
    description: "Desert noir with bronze glow",
    preview: {
      bg: "oklch(0.18 0.02 30)",
      sidebar: "oklch(0.14 0.018 28)",
      card: "oklch(0.23 0.022 30)",
      primary: "oklch(0.72 0.15 38)",
      fg: "oklch(0.95 0.01 70)",
      border: "oklch(0.31 0.02 30)",
    },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Mossy green terminal calm",
    preview: {
      bg: "oklch(0.19 0.03 155)",
      sidebar: "oklch(0.15 0.028 155)",
      card: "oklch(0.24 0.03 155)",
      primary: "oklch(0.77 0.16 145)",
      fg: "oklch(0.95 0.02 140)",
      border: "oklch(0.31 0.03 155)",
    },
  },
  {
    id: "signal",
    name: "Signal",
    description: "High-contrast cyber teal",
    preview: {
      bg: "oklch(0.18 0.02 225)",
      sidebar: "oklch(0.14 0.018 225)",
      card: "oklch(0.23 0.02 225)",
      primary: "oklch(0.78 0.18 205)",
      fg: "oklch(0.96 0.01 220)",
      border: "oklch(0.31 0.02 225)",
    },
  },
  {
    id: "paper",
    name: "Paper",
    description: "Soft cream with ink blue",
    preview: {
      bg: "oklch(0.97 0.015 95)",
      sidebar: "oklch(0.92 0.02 95)",
      card: "oklch(0.99 0.01 95)",
      primary: "oklch(0.42 0.09 250)",
      fg: "oklch(0.24 0.03 255)",
      border: "oklch(0.88 0.02 95)",
    },
  },
  {
    id: "lagoon",
    name: "Lagoon",
    description: "Deep ocean blue with aqua light",
    preview: {
      bg: "oklch(0.2 0.035 230)",
      sidebar: "oklch(0.16 0.03 230)",
      card: "oklch(0.26 0.03 230)",
      primary: "oklch(0.78 0.14 190)",
      fg: "oklch(0.96 0.02 205)",
      border: "oklch(0.33 0.03 230)",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Burnt coral evening glow",
    preview: {
      bg: "oklch(0.22 0.04 18)",
      sidebar: "oklch(0.18 0.035 18)",
      card: "oklch(0.28 0.035 18)",
      primary: "oklch(0.76 0.16 28)",
      fg: "oklch(0.96 0.015 65)",
      border: "oklch(0.35 0.03 18)",
    },
  },
  {
    id: "graphite",
    name: "Graphite",
    description: "Slate monochrome with cobalt edges",
    preview: {
      bg: "oklch(0.22 0.01 255)",
      sidebar: "oklch(0.17 0.01 255)",
      card: "oklch(0.28 0.012 255)",
      primary: "oklch(0.7 0.13 255)",
      fg: "oklch(0.94 0.01 255)",
      border: "oklch(0.37 0.012 255)",
    },
  },
  {
    id: "rose",
    name: "Rose",
    description: "Muted berry dark with blush accents",
    preview: {
      bg: "oklch(0.23 0.035 355)",
      sidebar: "oklch(0.19 0.03 355)",
      card: "oklch(0.29 0.03 355)",
      primary: "oklch(0.78 0.14 355)",
      fg: "oklch(0.96 0.012 20)",
      border: "oklch(0.36 0.025 355)",
    },
  },
]

export const THEME_STORAGE_KEY = "leetly-theme"
