import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { CustomerMirrorPanel } from '../../src/components/primitives/CustomerMirrorPanel';
import type { WizardStep } from '../../src/lib/wizardTypes';
import { docsParameters } from '../_shared/docs';

const step = (key: string, label: string, text: string): WizardStep => ({ key, label, subheading: 'Read this carefully.', render: () => <p className="body-text">{text}</p> });

const meta = {
  title: 'Navigation/Customer Mirror Panel',
  component: CustomerMirrorPanel,
  parameters: {
    ...docsParameters({
      purpose: 'The shared view of a step: the current step drawn in the same container as the operator\'s step panel, without the operator\'s controls. Read-only unless `interactive`. An optional earlier step (`orderSummaryStep`) is shown read-only above it under `summaryLabel`.',
      source: 'src/components/primitives/CustomerMirrorPanel.tsx',
      variants: ['Read-only step.', '`interactive`: the step accepts input (`onSetValue`).', 'With a read-only summary step above.'],
      events: ['`onSetValue(field, value)` when `interactive`.'],
    }),
  },
  argTypes: { step: { control: false }, orderSummaryStep: { control: false }, values: { control: false }, onSetValue: { control: false } },
  args: { step: step('terms', 'Terms', 'The terms the person is agreeing to.'), values: {}, interactive: false, onSetValue: fn() },
} satisfies Meta<typeof CustomerMirrorPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { name: 'Terms' })).toBeVisible();
  },
};
export const WithSummaryAbove: Story = { args: { orderSummaryStep: step('summary', 'Summary', 'Item: Essential plan. Total: $115.00'), summaryLabel: 'Order Summary' } };
export const Interactive: Story = { args: { interactive: true } };
