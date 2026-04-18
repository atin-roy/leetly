import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold tracking-wide outline-none transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border border-primary/80 bg-primary text-primary-foreground shadow-[0_8px_24px_color-mix(in_oklab,var(--primary)_24%,transparent)] hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_12px_32px_color-mix(in_oklab,var(--primary)_28%,transparent)]",
        destructive:
          "border border-destructive/70 bg-destructive text-white shadow-[0_8px_24px_color-mix(in_oklab,var(--destructive)_22%,transparent)] hover:-translate-y-0.5 hover:bg-destructive/90 focus-visible:ring-destructive/30",
        outline:
          "border border-border/80 bg-card/80 shadow-sm backdrop-blur hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:text-primary",
        secondary:
          "border border-border/60 bg-secondary text-secondary-foreground shadow-sm hover:-translate-y-0.5 hover:bg-secondary/85",
        ghost:
          "text-muted-foreground hover:bg-accent/20 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-11 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-10",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
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
