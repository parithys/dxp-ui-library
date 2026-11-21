import * as React from "react"
import { cn } from "../../lib/utils"

// The app's multi-line field: the same `form-control` classes and border states as the Input (error by aria-invalid, filled when it has a value, default).
function Textarea({ className, value, ...props }: React.ComponentProps<"textarea">) {
  const invalid = props["aria-invalid"] === true || props["aria-invalid"] === "true"
  const filled = value !== undefined && value !== null && value !== ""
  const state = invalid ? "form-control-error" : filled ? "form-control-filled" : "form-control-default"

  return (
    <textarea
      value={value}
      data-slot="textarea"
      className={cn("form-control", state, className)}
      {...props}
    />
  )
}

export { Textarea }
