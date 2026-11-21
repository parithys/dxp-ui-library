"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Label as LabelPrimitive } from "radix-ui"

// A <label> and nothing else: Radix's behaviour (no text selection on a double click, the association through `htmlFor` or by wrapping) with NO
// look of its own, so it replaces any `<label className="...">` in the app without changing how that label is drawn - the call site keeps its
// own classes. The app's field-label look is the semantic class `field-label` (src/ui-components.css): pass it to draw a standard field label.
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(className)}
      {...props}
    />
  )
}

export { Label }
