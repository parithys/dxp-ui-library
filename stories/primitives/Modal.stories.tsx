import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button, Modal, INFO_ICON_PATH, WARNING } from '../../src';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Feedback & Status/Modal',
  component: Modal,
  parameters: {
    ...docsParameters({
      purpose:
        'A centred dialog reserved for short confirmation messages. Forms, signature capture and multi-step flows use a Drawer. A thin wrapper over the one Radix Dialog (`components/ui/dialog.tsx`).',
      source: 'src/components/primitives/Modal.tsx',
      variants: ['Width: `widthClassName` (default `max-w-lg`).', 'Optional `icon` tile and `subtitle` in the header.', 'Optional `footer` (right-aligned actions).'],
      states: ['Closed (renders nothing)', 'Open'],
      events: ['`onClose` - X button, Escape, or a click on the scrim.'],
      usage: ['Controlled: the caller owns `open`.', 'Destructive confirms put the safe action first (Cancel / Keep Working) and the committing action last.'],
      accessibility: [
        'Radix Dialog: `role="dialog"`, `aria-modal="true"`, named by its title (`aria-labelledby`); no description is wired (`aria-describedby` is undefined).',
        'Focus lands on the dialog container (not on a field), is trapped inside, and returns to the opener on close.',
        'The page behind is hidden from assistive technology and scroll-locked. Escape closes the top layer only; an open combobox keeps its own Escape.',
        'The close button is named "Close".',
      ],
      restrictions: ['Rendered in a portal on `<body>`; in the canvas the dialog appears over the story, not inside it.'],
    }),
  },
  argTypes: {
    open: { control: 'boolean', description: 'Whether the dialog is shown.' },
    title: { control: 'text', description: 'Dialog title; also its accessible name.' },
    subtitle: { control: 'text', description: 'A line under the title saying what the dialog acts on.' },
    widthClassName: { control: 'select', options: ['max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-2xl'], description: 'Width cap of the dialog (default max-w-lg).' },
    icon: { control: false, description: 'Icon path (assets/icons) for the tile beside the title.' },
    onClose: { action: 'closed' },
    children: { control: false },
    footer: { control: false },
  },
  args: { open: false, title: 'Discard changes?', onClose: fn(), children: 'Your changes have not been saved.' },
} satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;

type DemoProps = { title: string; subtitle?: string; icon?: string; widthClassName?: string; destructive?: boolean; startOpen?: boolean };

function ModalDemo({ title, subtitle, icon, widthClassName, destructive = false, startOpen = false }: DemoProps) {
  const [open, setOpen] = useState(startOpen);
  const [result, setResult] = useState('');
  const close = () => setOpen(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      {result && <p role="status" className="caption-muted">{result}</p>}
      <Modal
        open={open}
        onClose={close}
        title={title}
        subtitle={subtitle}
        icon={icon}
        widthClassName={widthClassName}
        footer={
          <>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button
              variant={destructive ? 'destructive' : 'default'}
              onClick={() => {
                setResult(destructive ? 'Deleted' : 'Confirmed');
                close();
              }}
            >
              {destructive ? 'Delete' : 'Confirm'}
            </Button>
          </>
        }
      >
        <p className="body-text">This is a short confirmation message. Longer forms belong in a Drawer.</p>
      </Modal>
    </>
  );
}

const dialog = () => within(document.body).findByRole('dialog');
const closed = () => waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());

export const Default: Story = {
  render: () => <ModalDemo title="Confirm action" />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open dialog' }));
    const d = await dialog();
    await expect(d).toHaveAttribute('aria-modal', 'true');
    await expect(within(d).getByRole('heading', { name: 'Confirm action' })).toBeVisible();
    await userEvent.click(within(d).getByRole('button', { name: 'Cancel' }));
    await closed();
  },
};

export const Closed: Story = { args: { open: false } };

export const OpenStatic: Story = {
  name: 'Open (controlled by args)',
  args: { open: true, subtitle: 'Order ORD-1001', icon: INFO_ICON_PATH },
};

export const WithIconAndSubtitle: Story = {
  render: () => <ModalDemo title="Review order" subtitle="Order ORD-1001 for Sample Customer" icon={INFO_ICON_PATH} startOpen />,
};

export const Wide: Story = {
  render: () => <ModalDemo title="Wide dialog" widthClassName="max-w-2xl" startOpen />,
};

export const DestructiveConfirm: Story = {
  render: () => <ModalDemo title="Delete this draft?" icon={WARNING} destructive />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open dialog' }));
    const d = await dialog();
    await userEvent.click(within(d).getByRole('button', { name: 'Delete' }));
    await closed();
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Deleted');
  },
};

export const EscapeCloses: Story = {
  render: () => <ModalDemo title="Press Escape" />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open dialog' }));
    await dialog();
    await userEvent.keyboard('{Escape}');
    await closed();
  },
};

export const OutsideClickCloses: Story = {
  render: () => <ModalDemo title="Click the scrim" />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open dialog' }));
    await dialog();
    const scrim = document.querySelector('[data-slot="dialog-overlay"]');
    await expect(scrim).not.toBeNull();
    await userEvent.click(scrim as HTMLElement);
    await closed();
  },
};

export const FocusTrapAndReturn: Story = {
  render: () => <ModalDemo title="Focus trap" />,
  play: async ({ canvasElement }) => {
    const opener = within(canvasElement).getByRole('button', { name: 'Open dialog' });
    await userEvent.click(opener);
    const d = await dialog();
    await waitFor(() => expect(d).toHaveFocus());
    // Tab more times than there are controls: focus never leaves the dialog.
    for (let i = 0; i < 6; i += 1) {
      await userEvent.tab();
      await expect(d.contains(document.activeElement)).toBe(true);
    }
    await userEvent.keyboard('{Escape}');
    await closed();
    await waitFor(() => expect(opener).toHaveFocus());
  },
};
