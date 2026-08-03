import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import styles from "./badge.module.css"

type Variant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link"

function badgeVariants({
  variant = "default",
}: { variant?: Variant | null } = {}) {
  return cn(styles.badge, styles[variant ?? "default"])
}

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & {
  variant?: Variant
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
