"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Dialog as DialogPrimitive } from "radix-ui"

// The app's overlay on Radix Dialog (Phase 6). Modal and Drawer (components/primitives) are thin wrappers over this; nothing else imports it but the
// dev showcase. Radix brings the focus trap, the body scroll lock, the hidden page behind (aria-hidden), the shared layer stack and the portal; this
// file keeps what the app's own overlays did that Radix does not do by default:
//   - the look is the app's classes (`scrim`, `scrim-center`, `modal-dialog`, `drawer-panel`), not stock shadcn utilities;
//   - focus lands on the dialog container, not on its first control (no caret or selection appears in a field the user did not choose);
//   - focus goes back to the element that opened it (the dialogs are controlled, there is no Trigger for Radix to return to);
//   - an Escape that belongs to an open combobox (the app's Select, the phone country list) closes that list, not the dialog;
//   - a "drawer" is not closed by a click outside it (typed form input is not lost to a stray click); a "modal" is.

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  /** modal: centred, a click on the scrim closes it. drawer: a side panel that slides in; a click outside does nothing. */
  variant?: "modal" | "drawer"
}

function DialogContent({ className, children, variant = "modal", ...props }: DialogContentProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  // The element that had focus when the dialog opened: where focus goes back to (read as Radix is about to move focus in).
  const opener = React.useRef<HTMLElement | null>(null)
  const drawer = variant === "drawer"
  return (
    <DialogPrimitive.Portal data-slot="dialog-portal">
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        // Drawer: the scrim animates out for as long as the panel does, so Radix keeps both mounted while the panel slides away.
        className={cn("scrim", !drawer && "scrim-center", drawer && "data-[state=closed]:animate-out [animation-duration:var(--motion-base)]")}
      >
        <DialogPrimitive.Content
          ref={ref}
          data-slot="dialog-content"
          aria-modal="true"
          aria-describedby={undefined}
          className={cn(
            drawer
              ? "drawer-panel data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right [animation-duration:var(--motion-base)]"
              : "modal-dialog",
            "outline-none",
            className
          )}
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            opener.current = document.activeElement as HTMLElement | null
            ref.current?.focus({ preventScroll: true })
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            const back = opener.current
            if (back && document.contains(back)) back.focus({ preventScroll: true })
          }}
          onEscapeKeyDown={(e) => {
            // Radix listens in the capture phase, before the field's own handler: leave an open combobox to close its own list first.
            if ((e.target as HTMLElement | null)?.closest?.("[role=combobox][aria-expanded=true]")) e.preventDefault()
          }}
          onInteractOutside={(e) => {
            if (drawer) e.preventDefault()
          }}
          {...props}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("stack gap-1", className)} {...props} />
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-footer" className={cn("actions-end", className)} {...props} />
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn(className)} {...props} />
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn("text-secondary", className)} {...props} />
}

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger }
