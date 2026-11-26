import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SummaryFieldRow } from '../../src/components/primitives/SummaryFieldRow';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Forms/Summary Field Row',
  component: SummaryFieldRow,
  parameters: {
    ...docsParameters({
      purpose: 'One label / value pair of a running summary. A value cut to its first few entries ("a, b, c +2 more") expands to the full list.',
      source: 'src/components/primitives/SummaryFieldRow.tsx (values come from `formatSummaryValue` in src/lib/stepSummary.ts)',
      variants: ['Plain value.', 'Empty value (muted "Not provided").', 'Long list with Show all / Show less.'],
      accessibility: ['The label is a `dt` and the value a `dd`; render rows inside a `dl`. The expander is a button with `aria-expanded`.'],
    }),
  },
  decorators: [(Story) => <dl style={{ maxWidth: 360 }}><Story /></dl>],
  args: { label: 'Plan', value: { text: 'Essential', empty: false } },
} satisfies Meta<typeof SummaryFieldRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { value: { text: 'Not provided', empty: true } } };
export const ExpandableList: Story = {
  args: { label: 'Add-ons', value: { text: 'Roaming, Music, Cloud +2 more', fullList: ['Roaming', 'Music', 'Cloud', 'Backup', 'Security'], empty: false } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Show all' }));
    await expect(c.getByText(/Roaming, Music, Cloud, Backup, Security/)).toBeVisible();
  },
};
