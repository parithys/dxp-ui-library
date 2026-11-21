import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button, Drawer, Input } from '../../src';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Feedback & Status/Drawer',
  component: Drawer,
  parameters: {
    ...docsParameters({
      purpose:
        'A side-anchored panel for everything that is not a short confirmation: forms, signature capture, plan details, multi-step flows. A thin wrapper over the one Radix Dialog (`variant="drawer"`).',
      source: 'src/components/primitives/Drawer.tsx',
      variants: [
        'Default title bar: small uppercase title beside the close control.',
        '`header`: replaces the title bar entirely (the caller supplies its own close control; `title` stays the accessible name).',
        '`footer`: buttons share the footer width equally.',
        '`bodyClassName`: replaces the body padding (default `px-6 py-6`).',
      ],
      states: ['Closed', 'Open (slides in from the right over the motion token)'],
      events: ['`onClose` - close control or Escape. A click outside does NOT close a Drawer, so typed input is not lost to a stray click.'],
      usage: ['Controlled: the caller owns `open`.', 'Width is 50% of the viewport with a floor on small screens; it is not configurable.'],
      accessibility: [
        'Radix Dialog: `role="dialog"`, `aria-modal="true"`, named by `title` (aria-labelledby; visually hidden when a custom `header` is used).',
        'Focus lands on the panel, is trapped, and returns to the opener on close. Escape closes it; the close button is named "Close".',
      ],
      devices: ['The panel is 50% of the viewport width, so on Tablet (768px) and Mobile (390px) it is narrower in pixels but takes the floor width; use the Tablet and Mobile stories (viewport) to check.'],
      restrictions: ['Portalled to `<body>`; it appears over the canvas, not inside it.'],
    }),
  },
  argTypes: {
    open: { control: 'boolean', description: 'Whether the drawer is shown.' },
    title: { control: 'text', description: 'Title; the dialog\'s accessible name.' },
    bodyClassName: { control: 'text', description: 'Replaces the default body padding.' },
    onClose: { action: 'closed' },
    children: { control: false },
    footer: { control: false },
    header: { control: false },
  },
  args: { open: false, title: 'Edit details', onClose: fn(), children: 'Drawer body' },
} satisfies Meta<typeof Drawer>;
export default meta;
type Story = StoryObj<typeof meta>;

function DrawerDemo({ withFooter = true, customHeader = false, startOpen = false, Component = Drawer }: { withFooter?: boolean; customHeader?: boolean; startOpen?: boolean; Component?: typeof Drawer }) {
  const [open, setOpen] = useState(startOpen);
  const close = () => setOpen(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Component
        open={open}
        onClose={close}
        title="Edit details"
        header={
          customHeader ? (
            <div className="drawer-header">
              <p className="title title-lg">Custom header</p>
              <Button variant="ghost" size="icon" aria-label="Close drawer" onClick={close}>
                x
              </Button>
            </div>
          ) : undefined
        }
        footer={
          withFooter ? (
            <>
              <Button variant="secondary" onClick={close}>
                Close
              </Button>
              <Button onClick={close}>Save</Button>
            </>
          ) : undefined
        }
      >
        <div className="stack gap-4">
          <Input label="Full name" placeholder="Type here" />
          <p className="caption-muted">Typed input is kept if you click outside the panel.</p>
        </div>
      </Component>
    </>
  );
}

const dialog = () => within(document.body).findByRole('dialog');
const closed = () => waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull(), { timeout: 3000 });

export const Default: Story = {
  render: () => <DrawerDemo />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open drawer' }));
    const d = await dialog();
    await expect(d).toHaveAttribute('aria-modal', 'true');
    await expect(within(d).getByText('Edit details')).toBeVisible();
    await userEvent.click(within(d).getAllByRole('button', { name: 'Close' })[0]);
    await closed();
  },
};

export const Closed: Story = { args: { open: false } };

export const OpenStatic: Story = { name: 'Open (controlled by args)', args: { open: true } };

export const WithoutFooter: Story = { render: () => <DrawerDemo withFooter={false} startOpen /> };

export const CustomHeader: Story = {
  render: () => <DrawerDemo customHeader startOpen />,
  play: async () => {
    const d = await dialog();
    // `title` stays the accessible name even though the header is the caller's own.
    await expect(d).toHaveAccessibleName('Edit details');
  },
};

export const EscapeCloses: Story = {
  render: () => <DrawerDemo />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open drawer' }));
    await dialog();
    await userEvent.keyboard('{Escape}');
    await closed();
  },
};

export const OutsideClickDoesNotClose: Story = {
  render: () => <DrawerDemo />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open drawer' }));
    const d = await dialog();
    await userEvent.type(within(d).getByRole('textbox', { name: /Full name/ }), 'Sample');
    const scrim = document.querySelector('[data-slot="dialog-overlay"]');
    await userEvent.click(scrim as HTMLElement);
    await expect(await dialog()).toBeVisible();
    await expect(within(d).getByRole('textbox', { name: /Full name/ })).toHaveValue('Sample');
  },
};

export const FocusTrapAndReturn: Story = {
  render: () => <DrawerDemo />,
  play: async ({ canvasElement }) => {
    const opener = within(canvasElement).getByRole('button', { name: 'Open drawer' });
    await userEvent.click(opener);
    const d = await dialog();
    await waitFor(() => expect(d).toHaveFocus());
    for (let i = 0; i < 8; i += 1) {
      await userEvent.tab();
      await expect(d.contains(document.activeElement)).toBe(true);
    }
    await userEvent.keyboard('{Escape}');
    await closed();
    await waitFor(() => expect(opener).toHaveFocus());
  },
};

export const Tablet: Story = {
  render: () => <DrawerDemo startOpen />,
  parameters: { viewport: { defaultViewport: 'tablet' } },
};

export const Mobile: Story = {
  render: () => <DrawerDemo startOpen />,
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
