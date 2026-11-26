import { OrderConfirmationScreen } from '../../src/components/primitives/OrderConfirmationScreen';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Feedback & Status/Order Confirmation Screen',
  component: OrderConfirmationScreen,
  parameters: {
    ...docsParameters({
      purpose: 'A persistent confirmation screen for a completed transaction: the outcome and reference numbers centred on top, then a receipt of summary lines, the actions and optional print actions.',
      source: 'src/components/primitives/OrderConfirmationScreen.tsx',
      variants: ['Receipt and actions.', 'With a `handoverPanel` slot beside the receipt.', 'With `headingNote`, `headerNote` and `activityId`.'],
      events: ['Each action\'s `onClick`.'],
    }),
  },
  argTypes: { actions: { control: false }, printActions: { control: false }, summaryLines: { control: false }, handoverPanel: { control: false }, headerNote: { control: false } },
  args: {
    heading: 'Order submitted',
    orderId: 'ORD-10042',
    summaryLines: [{ label: 'Item', value: 'Essential plan' }, { label: 'Total', value: '$115.00' }],
    actions: [{ label: 'Start another', onClick: fn(), variant: 'primary' }, { label: 'Back to dashboard', onClick: fn(), variant: 'secondary' }],
  },
} satisfies Meta<typeof OrderConfirmationScreen>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithNotesAndPrint: Story = {
  args: { headingNote: '(Waiting for review)', headerNote: 'The details were emailed.', activityId: 'ACT-3321', printActions: [{ label: 'Print receipt', onClick: fn(), variant: 'secondary' }] },
};
