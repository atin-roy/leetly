import * as React from "react"

import { cn } from "@/lib/utils"
import styles from "./field.module.css"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(styles.control, styles.input, className)}
      {...props}
    />
  )
}

export { Input }
