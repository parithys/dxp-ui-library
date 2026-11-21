import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button, SEARCH_ICON, LOCK } from '../../src';
import { EmptyState, EMPTY_STATE_ICON } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Column, Specimen } from '../_shared/layout';

const meta = {
  title: 'Feedback & Status/Empty State',
  component: EmptyState,
  parameters: {
    ...docsParameters({
      purpose: 'The one way to say "nothing here": what a list, tab, table or panel shows when it has nothing to show. The picture, spacing and layout are fixed; the title, message and action are the scenario\'s own.',
      source: 'src/components/primitives/EmptyState.tsx',
      variants: ['`compact` for a state inside a card, table or narrow panel; default for a whole page or tab.', 'Optional `title`, `message`, `icon` (24px-grid path) and `action` (a Button or link).', '`role`: `status` (default), `alert`, or `none`.'],
      states: ['Message only', 'Title + message', 'With action', 'Custom icon', 'Compact'],
      usage: ['Say what is missing and, where there is something to do about it, offer it (e.g. "Clear Filters").', 'Do not use for a load failure - that is an error message (EntityMissing, ErrorBanner).'],
      accessibility: ['Rendered with `role="status"` by default (polite live region); pass `role="none"` for a static empty state that should not be announced. The icon is `aria-hidden`.'],
    }),
  },
  argTypes: {
    title: { control: 'text', description: 'What is missing, in a few words (Title Case).' },
    message: { control: 'text', description: 'Why it is empty, or what happens next.' },
    compact: { control: 'boolean', description: 'Smaller picture and spacing, for use inside a card or table.' },
    role: { control: 'select', options: ['status', 'alert', 'none'], description: 'ARIA role of the container.' },
    icon: { control: false },
    action: { control: false },
    className: { control: false },
  },
  args: { title: 'No Numbers Reserved', message: 'No numbers have been reserved for this customer.', compact: false, role: 'status' },
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const s = within(canvasElement).getByRole('status');
    await expect(s).toHaveTextContent('No Numbers Reserved');
  },
};
export const MessageOnly: Story = { args: { title: undefined, message: 'No orders match your search.' } };
export const WithAction: Story = {
  args: { title: undefined, message: 'No orders match your search.', action: <Button variant="secondary">Clear Filters</Button> },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Clear Filters' })).toBeVisible();
  },
};
export const CustomIcon: Story = { args: { icon: SEARCH_ICON, title: 'No Results', message: 'Try a different search term.' } };
export const Compact: Story = { args: { compact: true, title: undefined, message: 'No documents uploaded yet.' } };
export const NonAnnounced: Story = {
  name: 'role="none"',
  args: { role: 'none' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('status')).toBeNull();
  },
};

export const AllVariants: Story = {
  render: () => (
    <Column>
      <Specimen label="Page size, title + message">
        <EmptyState title="No Drafts" message="Saved drafts appear here." />
      </Specimen>
      <Specimen label="With action">
        <EmptyState message="No orders match your search." action={<Button variant="secondary">Clear Filters</Button>} />
      </Specimen>
      <Specimen label="Custom icon">
        <EmptyState icon={LOCK} title="Restricted" message="Access is limited for your role." />
      </Specimen>
      <Specimen label="Compact">
        <EmptyState compact icon={EMPTY_STATE_ICON} message="Nothing to show." />
      </Specimen>
    </Column>
  ),
};
