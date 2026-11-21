import type { ReactNode } from 'react';
import { CloseButton } from './CloseButton';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Replaces the default title bar entirely (the caller then supplies its own close control). `title` is still the dialog's accessible name. */
  header?: ReactNode;
  /** Replaces the default body padding. */
  bodyClassName?: string;
}

// Side drawer for everything that is not a short confirmation (see Modal.tsx) - forms, signature capture and multi-step flows read as more seamless
// sliding in from the edge than interrupting the screen with a centred dialog. Width is 50% of the viewport (with a floor on small screens), not
// configurable, so every drawer looks the same: the title as a small uppercase label beside the close control, the body on the page tint, and a footer
// whose buttons share its width equally. Since Phase 6 this is the shadcn / Radix Dialog (components/ui/dialog.tsx, variant "drawer"): the panel
// slides in and out over --motion-base, and - unlike a Modal - a click outside it does NOT close it, so a stray click cannot lose in-progress form
// input; only the close control or Escape do.
export function Drawer({ open, onClose, title, children, footer, header, bodyClassName = 'px-6 py-6' }: DrawerProps) {
  // Server rendering has no document for Radix's portal: render the content in place (the tests render screens this way; the app itself is client-only).
  if (typeof document === 'undefined') {
    return open ? (
      <div role="dialog" aria-label={title}>
        {header ?? <h2>{title}</h2>}
        <div className={bodyClassName}>{children}</div>
        {footer && <div className="drawer-footer">{footer}</div>}
      </div>
    ) : null;
  }
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent variant="drawer">
        {header ? (
          <>
            {/* The caller's own header is the visible title; the dialog is still named by `title`. */}
            <DialogTitle className="sr-only">{title}</DialogTitle>
            {header}
          </>
        ) : (
          <div className="drawer-header">
            <DialogTitle className="caption-muted uppercase tracking-wide">{title}</DialogTitle>
            <CloseButton onClick={onClose} />
          </div>
        )}
        <div className={`flex-1 overflow-y-auto bg-[var(--surface)] ${bodyClassName}`}>{children}</div>
        {/* The footer's buttons share its width equally (Close beside the primary action). */}
        {footer && <div className="drawer-footer">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
