import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, OverlayPortal } from '../../src';
import { docsParameters } from '../_shared/docs';
import { SideBySide } from '../_shared/layout';

const meta = {
  title: 'Feedback & Status/Dialog (base)',
  component: Dialog,
  parameters: {
    ...docsParameters({
      purpose:
        'The one Radix Dialog the app\'s overlays are built on. Modal and Drawer wrap it; screens use those. Shown here to document the shared behaviour (focus, scroll lock, outside click) and the parts (`DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogTrigger`).',
      source: 'src/components/ui/dialog.tsx; src/components/primitives/OverlayPortal.tsx',
      variants: ['`DialogContent variant="modal"` (default): centred; a click on the scrim closes it.', '`DialogContent variant="drawer"`: right-side panel that slides in; a click outside does nothing.'],
      states: ['Closed', 'Open'],
      events: ['`onOpenChange(next)` on `Dialog` - Escape, scrim click (modal only), a `DialogClose`, or a trigger.'],
      usage: ['Prefer `Modal` or `Drawer`; import the base only for a new overlay family.', '`OverlayPortal` renders any element on `<body>` (outside stacking contexts such as the wizard action bar); it renders in place with no DOM.'],
      accessibility: [
        '`role="dialog"`, `aria-modal="true"`, labelled by `DialogTitle`. `aria-describedby` is deliberately undefined unless a caller passes one.',
        'Focus moves to the dialog container on open and returns to the opener on close (the app overrides Radix\'s first-control focus and trigger return).',
        'Escape closes the top layer; an Escape from inside an expanded combobox is left to that combobox.',
      ],
      restrictions: ['`DialogTitle` is required for an accessible name; Radix warns when it is missing.'],
    }),
  },
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

function Sample({ variant }: { variant: 'modal' | 'drawer' }) {
  return (
    <DialogContent variant={variant} className={variant === 'modal' ? 'max-w-md' : undefined}>
      <DialogHeader>
        <DialogTitle className="title title-lg">{variant === 'modal' ? 'Modal-style dialog' : 'Drawer-style dialog'}</DialogTitle>
        <DialogDescription>{variant === 'modal' ? 'A click on the scrim closes this.' : 'A click outside does nothing; use the buttons or Escape.'}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">Cancel</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

function Demo({ variant }: { variant: 'modal' | 'drawer' }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open {variant}</Button>
      </DialogTrigger>
      <Sample variant={variant} />
    </Dialog>
  );
}

const closed = () => waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull(), { timeout: 3000 });

export const Default: Story = {
  render: () => <Demo variant="modal" />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Open modal' });
    await userEvent.click(trigger);
    const d = await within(document.body).findByRole('dialog');
    await expect(d).toHaveAttribute('aria-modal', 'true');
    await expect(d).toHaveAccessibleName('Modal-style dialog');
    await userEvent.keyboard('{Escape}');
    await closed();
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const DrawerVariant: Story = {
  name: 'Drawer variant',
  render: () => <Demo variant="drawer" />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open drawer' }));
    await within(document.body).findByRole('dialog');
    await userEvent.click(document.querySelector('[data-slot="dialog-overlay"]') as HTMLElement);
    await expect(within(document.body).getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await closed();
  },
};

export const ModalAndDrawerSideBySide: Story = {
  name: 'Both variants',
  render: () => (
    <SideBySide>
      <Demo variant="modal" />
      <Demo variant="drawer" />
    </SideBySide>
  ),
};

export const OverlayOnBody: Story = {
  name: 'OverlayPortal',
  render: () => (
    <div className="stack gap-2">
      <p className="body-text">The paragraph below is rendered through OverlayPortal: it is a child of the document body, not of this story.</p>
      <OverlayPortal>
        <p data-testid="portalled" className="caption-muted">
          Portalled to body.
        </p>
      </OverlayPortal>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const el = within(document.body).getByTestId('portalled');
    await expect(el.parentElement).toBe(document.body);
    await expect(canvasElement.contains(el)).toBe(false);
  },
};
