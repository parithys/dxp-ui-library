import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within, screen } from 'storybook/test';
import { TooltipGroup, Tooltip, IconButton, COPY, DOWNLOAD_ICON, PRINT_ICON } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Row } from '../_shared/layout';

const meta = {
  title: 'Primitives/Tooltip Group',
  component: TooltipGroup,
  parameters: {
    layout: 'centered',
    ...docsParameters({
      purpose: 'Wraps an icon row, toolbar or nav so consecutive tooltips skip the full show delay once the first has appeared, matching how a pointer scans a toolbar. Optional: Tooltip works without it.',
      source: 'src/components/primitives/TooltipContext.tsx, tooltipGroup.ts',
      states: ['After a tooltip in the group shows, the next one opens at once for the window set by `--tooltip-group-window` (500 ms by default).'],
      usage: ['Wrap one cluster of related icon controls, not the whole page.'],
      accessibility: ['No markup of its own and no roles; each Tooltip keeps `role="tooltip"` and `aria-describedby` on its trigger.'],
    }),
  },
  argTypes: { children: { control: false, description: 'The cluster of Tooltip-wrapped controls.' } },
} satisfies Meta<typeof TooltipGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <Row>
        <Tooltip content="Download" placement="bottom"><IconButton icon={DOWNLOAD_ICON} label="Download" /></Tooltip>
        <Tooltip content="Print" placement="bottom"><IconButton icon={PRINT_ICON} label="Print" /></Tooltip>
        <Tooltip content="Copy" placement="bottom"><IconButton icon={COPY} label="Copy" /></Tooltip>
      </Row>
    ),
  },
  decorators: [(Story) => <div style={{ padding: 60 }}><Story /></div>],
  parameters: { docs: { description: { story: 'Hover the first icon, then move to the next: the second tooltip appears without the full show delay.' } } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.hover(c.getByRole('button', { name: 'Download' }));
    // (The previous tooltip can still be fading out while the next opens, so look for the one with the wanted text, not for a single tooltip.)
    const shown = (text: string) => screen.queryAllByRole('tooltip').some((t: HTMLElement) => t.textContent?.includes(text));
    await waitFor(() => expect(shown('Download')).toBe(true));
    await userEvent.hover(c.getByRole('button', { name: 'Print' }));
    await waitFor(() => expect(shown('Print')).toBe(true));
  },
};
