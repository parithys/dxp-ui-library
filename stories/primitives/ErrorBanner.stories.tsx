import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ErrorBanner } from '../../src';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Feedback & Status/Error Banner',
  component: ErrorBanner,
  parameters: {
    ...docsParameters({
      purpose: 'The red inline box a list screen shows when its fetch failed (as opposed to the list being genuinely empty). Shared so every list screen reading an entity error renders it the same way.',
      source: 'src/components/primitives/ErrorBanner.tsx',
      variants: ['One look: `.notice-danger` box with danger text.'],
      states: ['Visible (a message is given)', 'Not rendered (no message or an empty string)'],
      usage: ['Pass the error message from the data layer; render it above the list. The other notice callouts are on Messages / Notices.'],
      accessibility: ['`role="alert"`, so the message is announced as soon as it appears. The text carries the meaning, not only the colour.'],
    }),
  },
  argTypes: { message: { control: 'text', description: 'The error text. Nothing is rendered when empty or undefined.' } },
  args: { message: 'The list could not be loaded.' },
} satisfies Meta<typeof ErrorBanner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent('The list could not be loaded.');
  },
};

export const NoMessage: Story = {
  name: 'No message (renders nothing)',
  args: { message: undefined },
  render: (args) => (
    <div data-testid="host">
      <ErrorBanner {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('alert')).toBeNull();
  },
};
