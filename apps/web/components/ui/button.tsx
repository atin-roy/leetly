import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import styles from "./button.module.css"

type Variant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"

type Size =
  | "default"
  | "xs"
  | "sm"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg"

const sizeClass: Record<Size, string> = {
  default: styles.sizeDefault,
  xs: styles.sizeXs,
  sm: styles.sizeSm,
  lg: styles.sizeLg,
  icon: styles.sizeIcon,
  "icon-xs": styles.sizeIconXs,
  "icon-sm": styles.sizeIconSm,
  "icon-lg": styles.sizeIconLg,
}

function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: Variant | null
  size?: Size | null
  className?: string
} = {}) {
  return cn(
    styles.button,
    styles[variant ?? "default"],
    sizeClass[size ?? "default"],
    className,
  )
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: Variant
  size?: Size
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  )
}

export { Button, buttonVariants }
