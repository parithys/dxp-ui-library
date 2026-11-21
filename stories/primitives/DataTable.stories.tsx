import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DataTable, type Column, Badge, Button } from '../../src';
import { docsParameters } from '../_shared/docs';

interface Order { id: string; customer: string; plan: string; amount: number; status: string }

const ORDERS: Order[] = Array.from({ length: 12 }, (_, i) => ({
  id: `ORD-${1001 + i}`,
  customer: ['Aisha Al-Thani', 'Mohammed Khan', 'Fatima Hassan', 'John Smith'][i % 4],
  plan: ['Postpaid 145', 'Postpaid 245', 'Prepaid Starter'][i % 3],
  amount: 50 + ((i * 37) % 200),
  status: ['Completed', 'Pending', 'Failed'][i % 3],
}));

const COLUMNS: Column<Order>[] = [
  { key: 'id', header: 'Order', strong: true },
  { key: 'customer', header: 'Customer' },
  { key: 'plan', header: 'Plan' },
  { key: 'amount', header: 'Amount (QAR)', numeric: true },
  { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'Completed' ? 'success' : r.status === 'Failed' ? 'danger' : 'warning'}>{r.status}</Badge> },
];

const meta = {
  title: 'Primitives/Data Display/Data Table',
  component: DataTable<Order>,
  parameters: {
    ...docsParameters({
      purpose: 'The app\'s table engine (PROTECTED): sortable columns, paging, whole-row click, per-column links, empty / loading, framed or plain.',
      source: 'src/components/primitives/DataTable.tsx',
      variants: ['`variant`: `framed` (default, bordered card, sortable header) | `plain` (inside an existing card; sticky header, max 70vh scroll; no header when empty).', '`dense` tighter rows; `fixedLayout` honours column widths from `cellClassName`.', 'Column options: `numeric`, `strong`, `render`, `sortable`, `sortValue`, `linkTo`, `hideHeader`, `cellClassName`.'],
      states: ['Populated, empty (`emptyMessage` + `emptyAction`), loading, sorted ascending / descending / unsorted, selected row (`selectedKey`, `aria-current`), paged.', 'There is no multi-row checkbox selection; "selection" is the single `selectedKey` row.'],
      events: ['`onRowClick(row)` - click, Enter or Space on a focused row (keys pressed inside a control in the row are left to that control).', 'Header click cycles sort: ascending, descending, off.'],
      usage: ['Lists and grids of records. `pageSize` default 50; `Infinity` disables paging.'],
      accessibility: ['Sortable headers are buttons inside `<th scope="col" aria-sort>`. Clickable rows get `tabIndex=0`. An empty-header column reads "Actions" to screen readers.'],
    }),
  },
  argTypes: {
    variant: { control: 'select', options: ['framed', 'plain'], description: 'Frame style.' },
    dense: { control: 'boolean', description: 'Tighter rows.' },
    fixedLayout: { control: 'boolean', description: 'Use column widths from cellClassName.' },
    loading: { control: 'boolean', description: 'Shows "Loading…".' },
    pageSize: { control: 'number', description: 'Rows per page.' },
    emptyMessage: { control: 'text', description: 'Text when there are no rows.' },
    selectedKey: { control: 'text', description: 'rowKey of the selected row.' },
    columns: { control: false },
    rows: { control: false },
    rowKey: { control: false },
    onRowClick: { control: false },
    emptyAction: { control: false },
  },
  args: { columns: COLUMNS, rows: ORDERS, rowKey: (r: Order) => r.id, pageSize: 5 },
} satisfies Meta<typeof DataTable<Order>>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Plain: Story = { args: { variant: 'plain' } };
export const Dense: Story = { args: { dense: true } };
export const NoPaging: Story = { args: { pageSize: Infinity, rows: ORDERS.slice(0, 4) } };
export const Empty: Story = {
  args: { rows: [], emptyMessage: 'No orders match your search.', emptyAction: <Button variant="secondary">Clear filters</Button> },
};
export const EmptyPlain: Story = { args: { rows: [], variant: 'plain', emptyMessage: 'No orders.' } };
export const Loading: Story = { args: { loading: true } };
export const SelectedRow: Story = { args: { selectedKey: 'ORD-1002', pageSize: Infinity, rows: ORDERS.slice(0, 4) } };

export const Sorting: Story = {
  args: { pageSize: Infinity, rows: ORDERS.slice(0, 5) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const header = c.getByRole('columnheader', { name: /Amount/ });
    await expect(header).toHaveAttribute('aria-sort', 'none');
    await userEvent.click(within(header).getByRole('button'));
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(within(header).getByRole('button'));
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    await userEvent.click(within(header).getByRole('button'));
    await expect(header).toHaveAttribute('aria-sort', 'none');
  },
};

export const Paging: Story = {
  args: { pageSize: 5 },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('ORD-1001')).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: /next/i }));
    await expect(c.getByText('ORD-1006')).toBeVisible();
  },
};

export const RowClickAndSelection: Story = {
  name: 'Row click and selection',
  args: { pageSize: Infinity, rows: ORDERS.slice(0, 4), onRowClick: fn() },
  render: (args) => {
    const [selected, setSelected] = useState<string | undefined>();
    return <DataTable {...args} selectedKey={selected} onRowClick={(r) => { args.onRowClick?.(r); setSelected(r.id); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const row = c.getByText('ORD-1002').closest('tr');
    if (!row) throw new Error('row not found');
    await userEvent.click(row);
    await expect(args.onRowClick).toHaveBeenCalledTimes(1);
    await expect(row).toHaveAttribute('aria-current', 'true');
    const third = c.getByText('ORD-1003').closest('tr');
    if (!third) throw new Error('row not found');
    third.focus();
    await userEvent.keyboard('{Enter}');
    await expect(third).toHaveAttribute('aria-current', 'true');
    await userEvent.keyboard(' ');
    await expect(args.onRowClick).toHaveBeenCalledTimes(3);
  },
};
