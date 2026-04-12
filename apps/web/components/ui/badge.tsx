import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--accent-solid)] text-[var(--accent-contrast)]",
        secondary:
          "border-[var(--border-default)] bg-[var(--surface-muted)] text-[var(--text-primary)]",
        destructive:
          "border-transparent bg-[var(--chart-5)] text-white",
        outline:
          "border-[var(--border-strong)] bg-transparent text-[var(--text-secondary)]",
        ghost:
          "border-transparent bg-[var(--surface-accent)] text-[var(--text-primary)]",
        link: "border-transparent px-0 text-[var(--accent-solid)] underline underline-offset-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
