import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within, screen } from 'storybook/test';
import { Tooltip, Badge, Button } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Row } from '../_shared/layout';

const meta = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    ...docsParameters({
      purpose: 'The app\'s only tooltip (PROTECTED): portalled to `document.body`, shown on hover and keyboard focus, flips when it would clip the viewport, never a native `title`.',
      source: 'src/components/primitives/Tooltip.tsx, tooltipGroup.ts',
      variants: ['`placement`: `top` | `right` (default) | `bottom` | `left`; flips to the opposite side on viewport collision.', '`anchorRef`: measures the gap from another element\'s edge (the collapsed nav rail).'],
      states: ['Hidden, visible (after the show delay from `--tooltip-show-delay`), dismissed with Escape.', '`disabled` renders the child untouched.'],
      usage: ['A label of 1-5 words on an icon control, chip or badge. Not for documentation or for controls that already have a visible label.', 'Plain text elements (`span`, `div`, `td` ...) and Badge become focusable (`tabIndex=0`) so keyboard users can reach the tip.'],
      accessibility: ['The tooltip is `role="tooltip"` and the trigger gets `aria-describedby` while it is visible.', 'Escape closes it without moving focus or the pointer (WCAG 1.4.13); hovering the tooltip itself keeps it open.'],
    }),
  },
  argTypes: {
    content: { control: 'text', description: 'Tooltip copy.' },
    placement: { control: 'select', options: ['top', 'right', 'bottom', 'left'], description: 'Preferred side.' },
    disabled: { control: 'boolean', description: 'Skip the tooltip entirely.' },
    children: { control: false },
    anchorRef: { control: false },
  },
  args: { content: 'Download statement', placement: 'top', children: <Button variant="secondary">Hover or focus me</Button> },
  render: (args) => (
    <div style={{ padding: 80 }}>
      <Tooltip {...args}>
        <Button variant="secondary">Hover or focus me</Button>
      </Tooltip>
    </div>
  ),
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OpensOnHover: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    await userEvent.hover(trigger);
    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Download statement'));
    await userEvent.unhover(trigger);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  },
};

export const OpensOnFocusAndEscape: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button')).toHaveFocus();
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  },
};

export const Placements: Story = {
  render: () => (
    <Row>
      {(['top', 'right', 'bottom', 'left'] as const).map((p) => (
        <div key={p} style={{ padding: 60 }}>
          <Tooltip content={`Placed ${p}`} placement={p}><Button variant="secondary">{p}</Button></Tooltip>
        </div>
      ))}
    </Row>
  ),
  parameters: { docs: { description: { story: 'Hover or tab to each button to see its side. Near an edge the tooltip flips.' } } },
};

export const OnBadgeAndText: Story = {
  name: 'On a badge and plain text (made focusable)',
  render: () => (
    <div style={{ padding: 60 }}>
      <Row>
        <Tooltip content="Needs manager approval" placement="bottom"><Badge variant="info">Requires approval</Badge></Tooltip>
        <Tooltip content="Customer since 2019" placement="bottom"><span>Hover or tab to this text</span></Tooltip>
      </Row>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByText('Requires approval')).toHaveFocus();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));
    await expect(screen.queryByRole('tooltip')).toBeNull();
  },
};
