import type { ReactNode } from 'react';
import { CloseButton } from './CloseButton';
import { Icon } from './Icon';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Width cap of the dialog. Defaults to the short-confirmation size. */
  widthClassName?: string;
  /** An icon path (assets/icons) for the tile beside the title: what the dialog is about. Optional. */
  icon?: string;
  /** A line under the title saying what the dialog acts on. Optional. */
  subtitle?: string;
}

// Every Modal has the same sectioned layout: a header (an optional icon tile, the title, an optional subtitle, the close button), the body and the footer, each
// set off by a rule. Reserved (as of 2026-09-12) for short confirmation messages; forms, signature capture and multi-step flows are a Drawer (side-anchored, less
// disruptive). Since Phase 6 this is the shadcn / Radix Dialog (components/ui/dialog.tsx) wearing the app's look: Radix owns the focus trap, the body
// scroll lock, the hidden page behind (aria-hidden), the layer stack (Escape closes the top layer only) and the portal on <body>; the dialog is named
// by its title (aria-labelledby). A click on the scrim closes a Modal. The API is unchanged: callers still pass open / onClose / title / footer.
export function Modal({ open, onClose, title, children, footer, widthClassName = 'max-w-lg', icon, subtitle }: ModalProps) {
  // Server rendering has no document for Radix's portal: render the content in place (the tests render screens this way; the app itself is client-only).
  if (typeof document === 'undefined') {
    return open ? (
      <div role="dialog" aria-label={title}>
        <h2 className="title title-lg">{title}</h2>
        {subtitle && <p className="caption-secondary">{subtitle}</p>}
        <div>{children}</div>
        {footer && <div className="actions-end mt-6">{footer}</div>}
      </div>
    ) : null;
  }
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className={`${widthClassName} modal-dialog-sectioned`}>
        <div className="modal-header">
          {icon && (
            <span className="modal-icon">
              <Icon path={icon} className="size-5 " />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <DialogTitle className="title title-xl">{title}</DialogTitle>
            {subtitle && <p className="caption-secondary">{subtitle}</p>}
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer actions-end">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
