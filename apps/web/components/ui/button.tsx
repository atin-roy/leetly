import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 outline-none focus-visible:ring-4",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--accent-solid)] text-[var(--accent-contrast)] shadow-[0_18px_40px_-24px_rgba(15,23,42,0.6)] hover:-translate-y-0.5 hover:bg-[color:color-mix(in_oklab,var(--accent-solid)_88%,white)] focus-visible:ring-[color:color-mix(in_oklab,var(--accent-solid)_28%,transparent)]",
        destructive:
          "border-transparent bg-[var(--chart-5)] text-white hover:-translate-y-0.5 hover:opacity-92 focus-visible:ring-[color:color-mix(in_oklab,var(--chart-5)_30%,transparent)]",
        outline:
          "border-[var(--border-strong)] bg-[color:color-mix(in_oklab,var(--surface-card)_82%,transparent)] text-[var(--text-primary)] hover:-translate-y-0.5 hover:border-[var(--text-primary)] hover:bg-[var(--surface-card)] focus-visible:ring-[color:color-mix(in_oklab,var(--accent-solid)_20%,transparent)]",
        secondary:
          "border-transparent bg-[var(--surface-muted)] text-[var(--text-primary)] hover:-translate-y-0.5 hover:bg-[var(--surface-accent)] focus-visible:ring-[color:color-mix(in_oklab,var(--accent-solid)_16%,transparent)]",
        ghost:
          "border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-accent)] hover:text-[var(--text-primary)] focus-visible:ring-[color:color-mix(in_oklab,var(--accent-solid)_16%,transparent)]",
        link:
          "border-transparent bg-transparent px-0 text-[var(--accent-solid)] underline underline-offset-4 hover:text-[var(--text-primary)]",
      },
      size: {
        default: "h-11 px-5",
        xs: "h-7 px-3 text-xs",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-6 text-sm",
        icon: "size-11",
        "icon-xs": "size-7",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
