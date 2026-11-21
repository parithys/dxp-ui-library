import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IconButton, DOWNLOAD_ICON, PRINT_ICON, TRASH, COPY } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Column, Row, Specimen } from '../_shared/layout';

const meta = {
  title: 'Primitives/Icon Button',
  component: IconButton,
  parameters: {
    ...docsParameters({
      purpose: 'The one icon-only button (download, print, copy, remove, more actions) with a required accessible label.',
      source: 'src/components/primitives/IconButton.tsx',
      variants: ['`tone`: `default` | `danger` (hover turns red).', '`bordered`: card border and fill (the kebab look).', '`size`: `md` (36px) | `sm` (28px).'],
      states: ['Idle, hover, focus-visible, disabled.'],
      events: ['`onClick` (required).'],
      usage: ['Use for tool actions next to content. To close a surface use Close Button.'],
      accessibility: ['`label` is required and becomes `aria-label`.'],
      devices: ['36px hit area; tablet.css scales control heights.'],
    }),
  },
  argTypes: {
    icon: { control: false, description: 'SVG path data from src/assets/icons.' },
    label: { control: 'text', description: 'Accessible name (required).' },
    tone: { control: 'select', options: ['default', 'danger'], description: 'Hover colour.' },
    bordered: { control: 'boolean', description: 'Card border and fill.' },
    size: { control: 'select', options: ['sm', 'md'], description: 'Hit area.' },
    disabled: { control: 'boolean' },
    onClick: { control: false },
  },
  args: { icon: DOWNLOAD_ICON, label: 'Download', onClick: fn() },
} satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const b = within(canvasElement).getByRole('button', { name: 'Download' });
    await userEvent.click(b);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};
export const Small: Story = { args: { size: 'sm' } };
export const Bordered: Story = { args: { bordered: true, icon: PRINT_ICON, label: 'Print' } };
export const DangerTone: Story = { args: { tone: 'danger', icon: TRASH, label: 'Remove' } };
export const Hover: Story = {
  args: { tone: 'danger', icon: TRASH, label: 'Remove' },
  play: async ({ canvasElement }) => { await userEvent.hover(within(canvasElement).getByRole('button')); },
};
export const Focus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button')).toHaveFocus();
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const AllVariants: Story = {
  render: () => (
    <Column>
      <Specimen label="Tones and sizes">
        <Row>
          <IconButton icon={COPY} label="Copy" />
          <IconButton icon={COPY} label="Copy (small)" size="sm" />
          <IconButton icon={TRASH} label="Remove" tone="danger" />
          <IconButton icon={PRINT_ICON} label="Print" bordered />
          <IconButton icon={PRINT_ICON} label="Print (disabled)" bordered disabled />
        </Row>
      </Specimen>
    </Column>
  ),
};

