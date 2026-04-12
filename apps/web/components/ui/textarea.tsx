import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full rounded-[1.4rem] border border-[var(--border-default)] bg-[color:color-mix(in_oklab,var(--surface-card)_76%,transparent)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)] focus:bg-[var(--surface-card)] focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--accent-solid)_18%,transparent)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
