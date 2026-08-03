import { render, screen, within } from "@/test/render"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { CommandPaletteDialog } from "./command-palette-dialog"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}))

const problems = [
  { id: 1, leetcodeId: 1, title: "Two Sum" },
  { id: 2, leetcodeId: 15, title: "3Sum" },
  { id: 3, leetcodeId: 167, title: "Two Sum II" },
  { id: 4, leetcodeId: 200, title: "Number of Islands" },
  { id: 5, leetcodeId: 3, title: "Longest Substring" },
]

vi.mock("@/hooks/use-problems", () => ({
  useProblemRefList: () => ({ data: problems }),
}))

/*
 * Radix's Dialog pulls in react-remove-scroll, whose ES5 CJS build resolves
 * React to null under Vitest's interop. It is also not what these tests are
 * about: the palette's own contribution is the ranking, the keyboard model and
 * the combobox/listbox wiring, all of which live inside the content. The real
 * Dialog is exercised in the app, and Radix's Popover is covered by the
 * problem-table tests.
 */
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}))

function open() {
  return render(<CommandPaletteDialog open onOpenChange={vi.fn()} />)
}

function input() {
  return screen.getByRole("combobox")
}

function optionLabels() {
  return screen
    .getAllByRole("option")
    .map((option) => option.textContent?.trim() ?? "")
}

beforeEach(() => {
  push.mockClear()
})

describe("CommandPaletteDialog", () => {
  it("shows navigation targets and no problems until something is typed", () => {
    open()

    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    // An untyped query would otherwise show an arbitrary alphabetical slice.
    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument()
  })

  it("matches problems on title substring", async () => {
    const user = userEvent.setup()
    open()

    await user.type(input(), "islands")

    expect(screen.getByText("Number of Islands")).toBeInTheDocument()
    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument()
  })

  it("matches problems on leetcode id prefix", async () => {
    const user = userEvent.setup()
    open()

    await user.type(input(), "16")

    expect(screen.getByText("Two Sum II")).toBeInTheDocument()
    expect(screen.queryByText("Number of Islands")).not.toBeInTheDocument()
  })

  it("ranks an id match above a title match", async () => {
    const user = userEvent.setup()
    open()

    // "3" is a prefix of leetcode id 3 (Longest Substring) and also the first
    // character of the title "3Sum". The id match must come first.
    await user.type(input(), "3")

    expect(optionLabels()).toEqual(["3Longest Substring", "153Sum"])
  })

  it("orders equally-ranked matches alphabetically, not by insertion", async () => {
    const user = userEvent.setup()
    open()

    // All three contain "sum" mid-title, so nothing separates them on rank.
    await user.type(input(), "sum")

    expect(optionLabels()).toEqual(["153Sum", "1Two Sum", "167Two Sum II"])
  })

  it("reports when nothing matches", async () => {
    const user = userEvent.setup()
    open()

    await user.type(input(), "zzzz")

    expect(screen.getByText(/No matches for/)).toBeInTheDocument()
  })

  it("moves the selection with the arrow keys and wraps at the ends", async () => {
    const user = userEvent.setup()
    open()

    const first = screen.getAllByRole("option")[0]
    expect(first).toHaveAttribute("aria-selected", "true")

    await user.keyboard("{ArrowDown}")
    expect(screen.getAllByRole("option")[1]).toHaveAttribute(
      "aria-selected",
      "true",
    )

    // Up from the second lands back on the first; up again wraps to the last.
    await user.keyboard("{ArrowUp}{ArrowUp}")
    const options = screen.getAllByRole("option")
    expect(options[options.length - 1]).toHaveAttribute("aria-selected", "true")
  })

  it("navigates to the highlighted result on Enter", async () => {
    const user = userEvent.setup()
    open()

    await user.type(input(), "islands")
    await user.keyboard("{Enter}")

    expect(push).toHaveBeenCalledWith("/problems/4")
  })

  it("resets the highlight when the query changes", async () => {
    const user = userEvent.setup()
    open()

    await user.keyboard("{ArrowDown}{ArrowDown}")
    await user.type(input(), "sum")

    // A stale index would leave a lower row highlighted, or none at all if the
    // new result set is shorter than the old one.
    expect(screen.getAllByRole("option")[0]).toHaveAttribute(
      "aria-selected",
      "true",
    )
  })

  it("clears the query when it closes so the next open starts fresh", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <CommandPaletteDialog open onOpenChange={onOpenChange} />,
    )

    await user.type(input(), "islands")
    await user.click(screen.getByText("Number of Islands"))

    expect(onOpenChange).toHaveBeenCalledWith(false)

    rerender(<CommandPaletteDialog open onOpenChange={onOpenChange} />)
    expect(input()).toHaveValue("")
  })

  it("exposes the highlighted option to assistive tech", async () => {
    const user = userEvent.setup()
    open()

    await user.type(input(), "islands")

    const selected = screen
      .getAllByRole("option")
      .find((option) => option.getAttribute("aria-selected") === "true")!

    expect(input()).toHaveAttribute("aria-activedescendant", selected.id)
    expect(within(selected).getByText("Number of Islands")).toBeInTheDocument()
  })
})
