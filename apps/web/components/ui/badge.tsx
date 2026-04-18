import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-all [&>svg]:pointer-events-none [&>svg]:size-3 focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "border-primary/25 bg-primary/12 text-primary [a&]:hover:bg-primary/18",
        secondary:
          "border-border/70 bg-secondary/70 text-secondary-foreground [a&]:hover:bg-secondary",
        destructive:
          "border-destructive/25 bg-destructive/10 text-destructive [a&]:hover:bg-destructive/15 focus-visible:ring-destructive/25",
        outline:
          "border-border/80 bg-card/50 text-foreground [a&]:hover:border-primary/40 [a&]:hover:text-primary",
        ghost: "border-transparent text-muted-foreground [a&]:hover:bg-accent/20 [a&]:hover:text-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
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
