import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { EntityMissing } from '../../src/components/primitives/EntityMissing';
import { docsParameters } from '../_shared/docs';
import { Column, Specimen } from '../_shared/layout';

const meta = {
  title: 'Feedback & Status/Entity Missing',
  component: EntityMissing,
  parameters: {
    ...docsParameters({
      purpose: 'What a detail screen shows when its record is not on screen: still loading, the load failed, or genuinely not found. The three are never confused (a reload or deep link used to flash "not found" while the list was still arriving), and not-found always offers a way back.',
      source: 'src/components/primitives/EntityMissing.tsx',
      variants: ['Loading: "Loading {what}…" (`role="status"`).', 'Error (`error`): "We could not load this {what} just now." with Try Again (when `onRetry`) and the back link (`role="alert"`).', 'Not found (default): "We could not find this {what}…" with the back link.'],
      states: ['loading', 'error', 'not found'],
      events: ['`onRetry` - the Try Again button.'],
      usage: ['Pair with `useKindPending` so loading is derived from the API layer rather than guessed.', 'Precedence: `error` wins over `loading`, which wins over not-found.'],
      accessibility: ['Error is announced assertively (`role="alert"`), loading politely (`role="status"`); the not-found state is static text with a link.'],
    }),
  },
  argTypes: {
    what: { control: 'text', description: 'Noun for the record, e.g. "order".' },
    loading: { control: 'boolean', description: 'The record is still arriving.' },
    error: { control: 'boolean', description: 'The load itself failed.' },
    backTo: { control: 'text', description: 'Path of the way back.' },
    backLabel: { control: 'text', description: 'Label of the way back.' },
    onRetry: { action: 'retry' },
  },
  args: { what: 'order', loading: false, error: false, backTo: '/orders', backLabel: 'Back to Orders', onRetry: fn() },
} satisfies Meta<typeof EntityMissing>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Not found',
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText(/We could not find this order/)).toBeVisible();
    await expect(c.getByRole('link', { name: 'Back to Orders' })).toBeVisible();
  },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Loading order…');
  },
};

export const LoadFailed: Story = {
  args: { error: true },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('alert')).toHaveTextContent('We could not load this order just now.');
    await userEvent.click(c.getByRole('button', { name: 'Try Again' }));
    await expect(args.onRetry).toHaveBeenCalled();
  },
};

export const ErrorWithoutRetry: Story = {
  args: { error: true, onRetry: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: 'Try Again' })).toBeNull();
  },
};

export const AllStates: Story = {
  render: (args) => (
    <Column>
      <Specimen label="Loading">
        <EntityMissing {...args} loading />
      </Specimen>
      <Specimen label="Load failed">
        <EntityMissing {...args} error />
      </Specimen>
      <Specimen label="Not found">
        <EntityMissing {...args} />
      </Specimen>
    </Column>
  ),
};
