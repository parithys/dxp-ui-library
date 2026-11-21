import * as React from "react"
import { cn } from "../../lib/utils"

// The app's text field. The look is the app's `form-control` classes (src/ui-components.css): the 12px radius, the --field-border colours (the contrast the
// app set deliberately), the focus and hover borders, the disabled look and the one field height (--field-height, which follows the device's control scale).
// The border state follows one rule: error (aria-invalid), read-only, filled (has a value) or default.
//
// Phase 4: this IS the field the app's Input (primitives/Input.tsx) draws - that component keeps the label, helper, error, addons, keypad and read-only
// focus rules and renders this for the control itself - so it carries nothing of its own beyond the state class: no width, no placeholder colour (the app
// shows no placeholder in its fields), and the caller's className sits last to size or place it.
function Input({ className, type, value, ...props }: React.ComponentProps<"input">) {
  const invalid = props["aria-invalid"] === true || props["aria-invalid"] === "true"
  const filled = value !== undefined && value !== null && value !== ""
  const state = invalid
    ? "form-control-error"
    : props.readOnly && !props.disabled
      ? "form-control-readonly"
      : filled
        ? "form-control-filled"
        : "form-control-default"

  return (
    <input
      type={type}
      value={value}
      data-slot="input"
      className={cn("form-control", state, className)}
      {...props}
    />
  )
}

export { Input }
