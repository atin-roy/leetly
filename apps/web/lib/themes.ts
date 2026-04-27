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
  | "bloom"
  | "studio"
  | "aurora"
  | "atlas"
  | "porcelain"
  | "sol"

export interface Theme {
  id: ThemeId
  name: string
  description: string
  mode: "light" | "dark"
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
    mode: "light",
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
    mode: "dark",
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
    mode: "dark",
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
    mode: "light",
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
    mode: "dark",
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
    mode: "dark",
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
    mode: "dark",
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
    mode: "light",
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
    mode: "dark",
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
    mode: "dark",
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
    mode: "dark",
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
    name: "Studio Night",
    description: "Ink-dark surfaces with studio vermilion accents",
    mode: "dark",
    preview: {
      bg: "oklch(0.18 0.012 18)",
      sidebar: "oklch(0.145 0.01 18)",
      card: "oklch(0.23 0.014 20)",
      primary: "oklch(0.59 0.20 30)",
      fg: "oklch(0.95 0.008 38)",
      border: "oklch(0.31 0.015 20)",
    },
  },
  {
    id: "bloom",
    name: "Bloom",
    description: "Blush paper with fresh botanical contrast",
    mode: "light",
    preview: {
      bg: "oklch(0.97 0.02 16)",
      sidebar: "oklch(0.93 0.035 16)",
      card: "oklch(0.995 0.008 30)",
      primary: "oklch(0.60 0.18 150)",
      fg: "oklch(0.33 0.05 8)",
      border: "oklch(0.89 0.03 16)",
    },
  },
  {
    id: "studio",
    name: "Studio",
    description: "Gallery white with vermilion editorial accents",
    mode: "light",
    preview: {
      bg: "oklch(0.985 0.004 85)",
      sidebar: "oklch(0.93 0.008 85)",
      card: "oklch(1 0 0)",
      primary: "oklch(0.59 0.20 30)",
      fg: "oklch(0.22 0.01 40)",
      border: "oklch(0.88 0.01 85)",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Icy mint with bright electric blue",
    mode: "light",
    preview: {
      bg: "oklch(0.97 0.02 185)",
      sidebar: "oklch(0.90 0.03 185)",
      card: "oklch(0.995 0.008 200)",
      primary: "oklch(0.61 0.18 238)",
      fg: "oklch(0.28 0.03 220)",
      border: "oklch(0.86 0.025 190)",
    },
  },
  {
    id: "atlas",
    name: "Atlas",
    description: "Mineral sand with map-room blues",
    mode: "light",
    preview: {
      bg: "oklch(0.95 0.015 80)",
      sidebar: "oklch(0.89 0.02 80)",
      card: "oklch(0.985 0.008 82)",
      primary: "oklch(0.45 0.11 245)",
      fg: "oklch(0.30 0.03 70)",
      border: "oklch(0.84 0.02 82)",
    },
  },
  {
    id: "porcelain",
    name: "Porcelain",
    description: "Cool porcelain with jade and plum details",
    mode: "light",
    preview: {
      bg: "oklch(0.98 0.006 250)",
      sidebar: "oklch(0.92 0.014 250)",
      card: "oklch(0.995 0.004 250)",
      primary: "oklch(0.54 0.12 170)",
      fg: "oklch(0.28 0.02 280)",
      border: "oklch(0.87 0.015 250)",
    },
  },
  {
    id: "sol",
    name: "Sol",
    description: "Golden morning notes with terracotta energy",
    mode: "light",
    preview: {
      bg: "oklch(0.97 0.022 92)",
      sidebar: "oklch(0.92 0.03 92)",
      card: "oklch(0.995 0.01 95)",
      primary: "oklch(0.67 0.15 55)",
      fg: "oklch(0.31 0.03 58)",
      border: "oklch(0.88 0.025 92)",
    },
  },
]

export const THEME_STORAGE_KEY = "leetly-theme"
