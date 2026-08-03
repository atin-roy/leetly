import { render, screen, within } from "@/test/render"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ProblemTable } from "./problem-table"
import type { ProblemSummaryDto } from "@/lib/types"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}))

const mutateAsync = vi.fn().mockResolvedValue(undefined)

vi.mock("@/hooks/use-problems", () => ({
  useUpdateProblemStatus: () => ({ mutateAsync, isPending: false }),
}))

vi.mock("@/hooks/use-reviews", () => ({
  useQuickReview: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

// The attempt dialog pulls in the whole form stack; the table's contract with
// it is just "opens with this problem id", which the stub can assert.
vi.mock("./attempt-form", () => ({
  AttemptForm: ({ open, problemId }: { open: boolean; problemId: number }) =>
    open ? <div data-testid="attempt-form">{problemId}</div> : null,
}))

vi.mock("./copy-problem-button", () => ({
  CopyProblemButton: () => <button type="button">Copy</button>,
}))

function makeProblem(overrides: Partial<ProblemSummaryDto> = {}): ProblemSummaryDto {
  return {
    id: 1,
    leetcodeId: 1,
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/",
    difficulty: "EASY",
    status: "UNSEEN",
    lastAttemptedAt: null,
    totalAttempts: 0,
    reviewCard: null,
    ...overrides,
  }
}

/*
 * The table renders a desktop <table> and a mobile card list at the same time,
 * hiding one with a media query. jsdom applies no CSS, so both are in the
 * document — queries are scoped to the table to avoid matching twice.
 */
function table() {
  return screen.getByRole("table")
}

describe("ProblemTable", () => {
  it("renders a row per problem", () => {
    render(
      <ProblemTable
        problems={[
          makeProblem({ id: 1, leetcodeId: 1, title: "Two Sum" }),
          makeProblem({ id: 2, leetcodeId: 15, title: "3Sum", difficulty: "MEDIUM" }),
        ]}
        pageSize={20}
      />,
    )

    expect(within(table()).getByText("Two Sum")).toBeInTheDocument()
    expect(within(table()).getByText("3Sum")).toBeInTheDocument()
  })

  it("pads short pages to a fixed height so the layout does not jump", () => {
    render(<ProblemTable problems={[makeProblem()]} pageSize={5} />)

    // One real row plus four fillers, inside the body.
    const body = table().querySelector("tbody")!
    expect(body.querySelectorAll("tr")).toHaveLength(5)
  })

  it("shows an empty state when there are no problems", () => {
    render(<ProblemTable problems={[]} pageSize={5} />)

    expect(within(table()).getByText("No problems found.")).toBeInTheDocument()
  })

  it("navigates to the problem when a row is clicked", async () => {
    const user = userEvent.setup()
    render(<ProblemTable problems={[makeProblem({ id: 42 })]} pageSize={1} />)

    await user.click(within(table()).getByText("Two Sum"))

    expect(push).toHaveBeenCalledWith("/problems/42")
  })

  it("does not navigate when an action inside the row is clicked", async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <ProblemTable
        problems={[makeProblem({ id: 42 })]}
        pageSize={1}
        onDelete={onDelete}
      />,
    )

    await user.click(within(table()).getByTitle("Remove problem"))

    expect(onDelete).toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it("opens the attempt form for the clicked problem", async () => {
    const user = userEvent.setup()
    render(<ProblemTable problems={[makeProblem({ id: 7 })]} pageSize={1} />)

    await user.click(within(table()).getByLabelText("Log attempt for Two Sum"))

    expect(screen.getByTestId("attempt-form")).toHaveTextContent("7")
  })

  it("offers review enrolment only when the problem is not already enrolled", () => {
    const onEnrollReview = vi.fn()
    const { rerender } = render(
      <ProblemTable
        problems={[makeProblem()]}
        pageSize={1}
        onEnrollReview={onEnrollReview}
      />,
    )

    expect(within(table()).getByTitle("Mark for review")).toBeInTheDocument()

    rerender(
      <ProblemTable
        problems={[
          makeProblem({
            reviewCard: {
              id: 3,
              state: "REVIEW",
              due: new Date().toISOString(),
              reps: 2,
              lapses: 0,
              stability: 12.5,
            },
          }),
        ]}
        pageSize={1}
        onEnrollReview={onEnrollReview}
      />,
    )

    expect(within(table()).queryByTitle("Mark for review")).not.toBeInTheDocument()
  })

  it("updates status optimistically from the popover", async () => {
    const user = userEvent.setup()
    render(<ProblemTable problems={[makeProblem({ status: "UNSEEN" })]} pageSize={1} />)

    await user.click(
      within(table()).getByLabelText("Change status for Two Sum"),
    )
    await user.click(await screen.findByText("Solved w/ Help"))

    expect(mutateAsync).toHaveBeenCalledWith("SOLVED_WITH_HELP")
  })
})
