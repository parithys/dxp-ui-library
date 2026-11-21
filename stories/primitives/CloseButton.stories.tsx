import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CloseButton } from '../../src';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Primitives/Close Button',
  component: CloseButton,
  parameters: {
    ...docsParameters({
      purpose: 'The one close (X) control for dialogs, drawers and panels: a ghost icon button with the `btn-close` hover fill and the app focus ring, wrapped in a left-placed Tooltip naming the action.',
      source: 'src/components/primitives/CloseButton.tsx',
      states: ['Idle, hover (fill and tooltip), focus-visible (ring and tooltip).'],
      events: ['`onClick` (required).'],
      usage: ['Use to close a surface. For other icon-only actions use Icon Button.'],
      accessibility: ['`aria-label` defaults to "Close" and is the tooltip text; the X glyph is `aria-hidden`. Enter and Space activate it.'],
    }),
  },
  argTypes: {
    onClick: { control: false, description: 'Called when the button is activated (required).' },
    label: { control: 'text', description: 'Accessible name and tooltip text (default "Close").' },
    className: { control: false },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof CloseButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const b = within(canvasElement).getByRole('button', { name: 'Close' });
    await userEvent.click(b);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const CustomLabel: Story = {
  args: { label: 'Dismiss panel' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Dismiss panel' })).toBeVisible();
  },
};

export const Hover: Story = {
  parameters: { docs: { description: { story: 'Hover shows the fill and the left-placed tooltip.' } } },
  play: async ({ canvasElement }) => {
    const b = within(canvasElement).getByRole('button', { name: 'Close' });
    await userEvent.hover(b);
    await expect(b).toBeVisible();
  },
};

export const Focus: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.tab();
    const b = within(canvasElement).getByRole('button', { name: 'Close' });
    await expect(b).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
