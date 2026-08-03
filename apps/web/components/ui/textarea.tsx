import * as React from "react"

import { cn } from "@/lib/utils"
import styles from "./field.module.css"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(styles.control, styles.textarea, className)}
      {...props}
    />
  )
}

export { Textarea }
