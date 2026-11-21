"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { CHECKBOX_TICK } from "../../assets/icons"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

// The app's checkbox on Radix (Phase 4). The tile is the app's `checkbox` class (src/ui-components.css): the 18px square, 4px radius, --field-border
// outline, red fill when checked and the app's focus look - it answers to Radix's data-state as well as to :checked. The tick is the app's own
// (18px tile, 2.25 stroke) drawn from src/assets/icons, so a checked box looks exactly as it did on the native input it replaces.
//
// What changed for callers: this is a button with role="checkbox" (state in aria-checked / data-state), not a native checkbox input; it reports a
// boolean through `onCheckedChange` instead of a change event (`checked === true`: Radix may also report "indeterminate"); there is no readOnly.
// A caller's className lands on the box itself (the old wrapper took it), e.g. `mt-1` to sit on a label's first line.
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn("checkbox relative shrink-0", className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="pointer-events-none absolute inset-0 transition-none"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="size-full">
          <path d={CHECKBOX_TICK} />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
