import { render, screen } from "@/test/render"
import { describe, expect, it } from "vitest"
import { MarkdownContent } from "./markdown-content"

/*
 * Notes, approaches and takeaways are user-authored markdown rendered back into
 * the page. react-markdown escapes embedded HTML unless rehype-raw is added,
 * and strips dangerous URL protocols — but both are defaults that a future
 * "let me just enable raw HTML" change would silently remove. These pin them.
 */
describe("MarkdownContent", () => {
  it("does not execute embedded script tags", () => {
    const { container } = render(
      <MarkdownContent content={`Hello <script>window.__pwned = true</script>`} />,
    )

    expect(container.querySelector("script")).toBeNull()
    expect(
      (globalThis as Record<string, unknown>).__pwned,
    ).toBeUndefined()
  })

  it("does not render raw event-handler attributes", () => {
    const { container } = render(
      <MarkdownContent content={`<img src="x" onerror="window.__pwned = true">`} />,
    )

    expect(container.querySelector("img[onerror]")).toBeNull()
    expect(
      (globalThis as Record<string, unknown>).__pwned,
    ).toBeUndefined()
  })

  it("strips javascript: URLs from markdown links", () => {
    const { container } = render(
      <MarkdownContent content="[click me](javascript:window.__pwned=true)" />,
    )

    // The href is dropped entirely rather than sanitised in place, so the
    // anchor keeps its text but loses the link role along with the URL.
    const anchor = container.querySelector("a")!
    expect(anchor).toHaveTextContent("click me")
    expect(anchor.getAttribute("href")).not.toMatch(/^javascript:/i)
    expect(screen.queryByRole("link", { name: "click me" })).toBeNull()
  })

  it("keeps ordinary links, and opens them safely", () => {
    render(<MarkdownContent content="[leetcode](https://leetcode.com/problems/two-sum/)" />)

    const link = screen.getByRole("link", { name: "leetcode" })
    expect(link).toHaveAttribute("href", "https://leetcode.com/problems/two-sum/")
    // Without noopener the opened page gets a handle on window.opener.
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"))
    expect(link).toHaveAttribute("target", "_blank")
  })

  it("renders fenced code as text, not markup", () => {
    const { container } = render(
      <MarkdownContent content={"```java\nSystem.out.println(\"<b>hi</b>\");\n```"} />,
    )

    expect(container.querySelector("b")).toBeNull()
    expect(container.textContent).toContain("<b>hi</b>")
  })
})
