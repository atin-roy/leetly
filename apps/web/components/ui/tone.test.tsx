import { render, screen } from "@/test/render"
import { describe, expect, it } from "vitest"
import { DifficultyBadge } from "@/components/problems/difficulty-badge"
import { StatusBadge } from "@/components/problems/status-badge"
import { NOTE_TAG_COLORS } from "@/lib/note-display"
import type { Difficulty, NoteTag, ProblemStatus } from "@/lib/types"

/*
 * These chips previously carried fixed Tailwind palette classes plus a `dark:`
 * variant that never applied, because the app selects whole themes with
 * [data-theme] and never sets a .dark class. The result was light-mode chips on
 * every dark theme.
 *
 * The classNameStrategy in vitest.config.mts leaves CSS Module names unhashed,
 * so these assert the tone contract directly: a shared `tone` class plus one
 * hue, and no fixed palette or dark: variant anywhere.
 */

const FIXED_PALETTE = /(^|\s)(bg|text|border)-(gray|slate|zinc|green|emerald|blue|sky|orange|amber|red|rose|purple|violet)-\d{2,3}/
const DARK_VARIANT = /(^|\s)dark:/

const difficulties: Difficulty[] = ["EASY", "MEDIUM", "HARD"]
const statuses: ProblemStatus[] = [
  "UNSEEN",
  "ATTEMPTED",
  "SOLVED_WITH_HELP",
  "SOLVED",
  "MASTERED",
]
const tags: NoteTag[] = ["GENERAL", "INTERVIEW", "LEARNING", "REVIEW", "STRATEGY"]

describe("semantic tones", () => {
  it.each(difficulties)("difficulty %s is theme-derived", (difficulty) => {
    render(<DifficultyBadge difficulty={difficulty} />)
    const className = screen.getByText(/Easy|Medium|Hard/).className

    expect(className).toContain("tone")
    expect(className).not.toMatch(FIXED_PALETTE)
    expect(className).not.toMatch(DARK_VARIANT)
  })

  it.each(statuses)("status %s is theme-derived", (status) => {
    const { container } = render(<StatusBadge status={status} />)
    const className = container.querySelector("[data-slot=badge]")!.className

    expect(className).toContain("tone")
    expect(className).not.toMatch(FIXED_PALETTE)
    expect(className).not.toMatch(DARK_VARIANT)
  })

  it.each(tags)("note tag %s is theme-derived", (tag) => {
    const className = NOTE_TAG_COLORS[tag]

    expect(className).toContain("tone")
    expect(className).not.toMatch(FIXED_PALETTE)
    expect(className).not.toMatch(DARK_VARIANT)
  })

  it("gives each difficulty a distinct hue", () => {
    const hues = difficulties.map((difficulty) => {
      const { container } = render(<DifficultyBadge difficulty={difficulty} />)
      const className = container.querySelector("[data-slot=badge]")!.className
      return className
    })

    expect(new Set(hues).size).toBe(difficulties.length)
  })

  it("uses one shared base class across every tone family", () => {
    const { container: difficultyEl } = render(
      <DifficultyBadge difficulty="EASY" />,
    )
    const { container: statusEl } = render(<StatusBadge status="SOLVED" />)

    const difficultyClasses =
      difficultyEl.querySelector("[data-slot=badge]")!.className.split(/\s+/)
    const statusClasses =
      statusEl.querySelector("[data-slot=badge]")!.className.split(/\s+/)

    // Both resolve green, so the full tone pair should be identical — proof
    // the two maps share one source rather than each defining its own greens.
    const difficultyTone = difficultyClasses.filter((c) =>
      ["tone", "green"].includes(c),
    )
    const statusTone = statusClasses.filter((c) => ["tone", "green"].includes(c))

    expect(difficultyTone.sort()).toEqual(["green", "tone"])
    expect(statusTone.sort()).toEqual(["green", "tone"])
  })
})
