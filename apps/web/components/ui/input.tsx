import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full rounded-[1.15rem] border border-[var(--border-default)] bg-[color:color-mix(in_oklab,var(--surface-card)_76%,transparent)] px-4 text-sm text-[var(--text-primary)] shadow-none outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)] focus:bg-[var(--surface-card)] focus:ring-4 focus:ring-[color:color-mix(in_oklab,var(--accent-solid)_18%,transparent)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
