"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Tabs as TabsPrimitive } from "radix-ui"

// The app's underline tabs on Radix Tabs (Phase 7). The look is the app's own classes (src/ui-components.css): `tab-strip` for the list and `tab` for a
// trigger, with the selected one styled by Radix's `data-state=active`. Radix brings the roving tabindex, the arrow / Home / End keys (wrapping) and
// selection on focus; TabStrip (components/primitives) wraps this with its items / active / onChange API.
//
// The root draws nothing (display: contents), so a strip sits in the page exactly where the old strip did. A trigger does not point `aria-controls` at a
// panel: the app renders the selected view itself, outside the tabs, so there is no panel for Radix to name.

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("contents", className)} {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn("tab-strip", className)} {...props} />
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return <TabsPrimitive.Trigger data-slot="tabs-trigger" className={cn("tab", className)} aria-controls={undefined} {...props} />
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("outline-none", className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
