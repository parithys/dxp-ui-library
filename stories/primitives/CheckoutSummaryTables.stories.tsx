import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { SummaryTables } from '../../src/components/primitives/CheckoutSummaryTables';
import type { SummaryTable } from '../../src/components/primitives/CheckoutSummaryTables';
import { docsParameters } from '../_shared/docs';

// Rows shaped like the ones the postpaid checkout builds (buildDetailedTables / buildCafSummaryRows): Postpaid Essential (PROD-107, $115), a Free number,
// a Physical SIM from stock. The figures are consistent with each other; they are not read from an order.
const ORDER_SUMMARY: SummaryTable = {
  title: 'Order Summary',
  boldLabels: true,
  rows: [
    { label: 'Customer Name', value: 'Alex Morgan' },
    { label: 'Plan', value: 'Postpaid Essential', detail: '$115 per month, 3 months commitment' },
    { label: 'Discount', value: '10% Discount for first 6 months' },
    { label: 'Mobile Number', value: '33002011' },
    { label: 'SIM Type', value: 'Physical' },
    { label: 'SIM Serial Number', value: '8974412009900129000' },
    { label: 'Bill Limit', value: '$115', agentOnly: true },
  ],
};
const DUE_TODAY: SummaryTable = {
  title: 'Upfront Charges',
  rows: [
    { label: 'Number Charge', value: '$0' },
    { label: 'Advance Payment', value: '$0' },
    { label: 'Due Today', value: '$0', boldLabel: true, boldValue: true, detail: 'VAT-inclusive' },
  ],
};
const BILL_EXPLAINER: SummaryTable = {
  title: 'Approximate Bill Explainer',
  agentOnly: true,
  rows: [
    { label: 'Plan Rental', value: '$115' },
    { label: 'Discounts', value: '-$11.50 for first 6 months' },
    { label: 'Monthly Bill Cycle', value: '1st of every-month' },
    { label: 'Approximate First Bill Amount', value: '$103.50', boldValue: true },
  ],
};

const meta = {
  title: 'Primitives/Checkout Summary Tables',
  component: SummaryTables,
  parameters: {
    ...docsParameters({
      purpose: 'The bordered two-column tables shared by Checkout and the CAF read-back: a red title row (optional), a label column and a value column with an optional muted detail line. Two columns on wide screens, stacked on narrow ones.',
      source: 'src/components/primitives/CheckoutSummaryTables.tsx (rows built by checkoutSummaryRows.ts / checkoutDetailedTables.ts; model types in checkoutSummaryModel.ts)',
      variants: [
        'One table, two tables, or three or more (the first sits in the left column and the rest stack on the right: Order Summary beside Upfront Charges and the Bill Explainer).',
        '`boldLabels` on a table, or `boldLabel` / `boldValue` on a row, for emphasis (totals).',
        '`agentOnly` on a table (the Approximate Bill Explainer) or a row (an operational figure such as the bill limit): the agent sees it, the customer\'s pop-up does not.',
        'Row `detail`: a muted second line under the value.',
      ],
      usage: ['The component only lays rows out; every figure is computed by the checkout hooks (`useCheckoutSummary`) from the same pricing the order is submitted with.'],
      accessibility: ['A real `table`: the title is a `th` with `scope="colgroup"`, every label cell is a `th scope="row"`. The detail line is part of the value cell.'],
      devices: ['The grid is `auto-fit`: it collapses to one column on a tablet-width page; tablet.css adds nothing here.'],
    }),
  },
  argTypes: { tables: { control: 'object', description: 'The tables to show (SummaryTable[]): optional title, bold-label flag, agent-only flag and rows.' } },
  args: { tables: [ORDER_SUMMARY, DUE_TODAY, BILL_EXPLAINER] },
} satisfies Meta<typeof SummaryTables>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('table')).toHaveLength(3);
    await expect(canvas.getByRole('rowheader', { name: 'Customer Name' })).toBeInTheDocument();
  },
};

export const SingleUntitledTable: Story = { args: { tables: [{ rows: ORDER_SUMMARY.rows.slice(0, 4) }] } };

export const TwoTables: Story = { args: { tables: [ORDER_SUMMARY, DUE_TODAY] } };

export const AgentOnlyTableAndRow: Story = { args: { tables: [ORDER_SUMMARY, BILL_EXPLAINER] } };

export const Tablet: Story = { parameters: { viewport: { defaultViewport: 'tablet' } } };

export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile' } } };
