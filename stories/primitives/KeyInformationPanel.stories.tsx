import type { Meta, StoryObj } from '@storybook/react-vite';
import { KeyInformationPanel } from '../../src/components/primitives/KeyInformationPanel';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Primitives/Key Information Panel',
  component: KeyInformationPanel,
  parameters: {
    ...docsParameters({
      purpose: 'The "Key Information" box shown before the CAF is signed: the terms the customer is agreeing to, as a bulleted list on a card surface.',
      source: 'src/components/primitives/KeyInformationPanel.tsx',
      variants: ['Each item is any ReactNode, so a bullet can carry emphasis or a link.'],
      usage: ['The items are built from the order\'s own facts (plan commitment, Star number lock-in, discount, HRN advance - `TncLegalFacts`), not typed per order.'],
      accessibility: ['A heading (h3) and a real list; no interactive controls of its own.'],
    }),
  },
  argTypes: { items: { control: 'object', description: 'The terms, one list item each.' } },
  args: {
    items: [
      'The plan has a 3-month commitment from activation.',
      'The Star number carries a 24-month lock-in period.',
      'A 10% discount applies to the monthly plan fee for 6 months.',
      'An advance payment of $500 is required at checkout.',
    ],
  },
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
} satisfies Meta<typeof KeyInformationPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleItem: Story = { args: { items: ['The plan has a 3-month commitment from activation.'] } };

export const RichItems: Story = { args: { items: [<strong key="a">Early termination fees apply</strong>, 'Charges are billed on the 1st of every month.'] } };

export const NoItems: Story = { args: { items: [] } };
