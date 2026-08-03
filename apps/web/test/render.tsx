import { render as rtlRender } from "@testing-library/react"
import type { ReactElement } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"

/*
 * Mirrors the providers components actually mount under in components/providers.tsx.
 * Rendering bare works until a component reaches for TooltipProvider, and then
 * fails with an error about its own internals rather than about the test setup.
 */
function Providers({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>
}

export function render(ui: ReactElement, options?: Parameters<typeof rtlRender>[1]) {
  return rtlRender(ui, { wrapper: Providers, ...options })
}

export * from "@testing-library/react"
