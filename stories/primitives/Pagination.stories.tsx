import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Pagination, usePagination } from '../../src';
import { Button } from '../../src';
import { docsParameters } from '../_shared/docs';


function PagedPagination(props: { initial: number; total: number; pageSize: number; onPage?: (p: number) => void }) {
  const [page, setPage] = useState(props.initial);
  return (
    <Pagination
      page={page}
      total={props.total}
      pageSize={props.pageSize}
      onPage={(p) => {
        setPage(p);
        props.onPage?.(p);
      }}
    />
  );
}

const meta = {
  title: 'Navigation/Pagination',
  component: Pagination,
  parameters: {
    ...docsParameters({
      purpose:
        'The one way to page a list: Pagination is the bar ("Page a of b" at the left, the Pager at the right); Pager (own page) is the bordered Previous / numbers / Next group; usePagination (capability) holds the page maths for a list.',
      source: 'src/components/primitives/Pagination.tsx, paginationModel.ts',
      variants: ['Pagination (label + pager).'],
      states: [
        'Current page: Primary button style with aria-current="page".',
        'First page: Previous disabled. Last page: Next disabled.',
        'More than 7 pages: first three, last three and the current page with neighbours, with "..." gaps (a gap that would hide one page shows that page).',
        'A single page (or an empty list) renders nothing.',
      ],
      events: ['onPage(page): the new 1-based page.'],
      usage: [
        'Pages are 1-based; `pageSize` Infinity means everything on one page. There is no page-size selector in the production component.',
        'usePagination(rows, pageSize, resetKey): clamps the page when the list shrinks and returns to page 1 when `resetKey` changes (a new search, filter or tab).',
      ],
      accessibility: [
        'The pager is a nav with aria-label "Pagination"; buttons are named "Previous page", "Next page" and "Page n".',
        'The current page has aria-current="page"; disabled ends use the native disabled attribute; Tab moves through the buttons, Enter / Space activate.',
        'The "..." gaps are aria-hidden.',
      ],
      devices: ['Control heights follow the --control-h tokens, which the tablet rules scale.'],
    }),
  },
  argTypes: {
    page: { control: { type: 'number', min: 1 }, description: '1-based current page (clamped to the last page).' },
    total: { control: { type: 'number', min: 0 }, description: 'Total number of rows.' },
    pageSize: { control: { type: 'number', min: 1 }, description: 'Rows per page.' },
    onPage: { control: false },
    className: { control: false },
  },
  args: { page: 1, total: 95, pageSize: 10, onPage: fn() },
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <PagedPagination initial={args.page} total={args.total} pageSize={args.pageSize} onPage={args.onPage} />,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Page 1 of 10')).toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Next page' }));
    await expect(c.getByText('Page 2 of 10')).toBeInTheDocument();
    await expect(args.onPage).toHaveBeenCalledWith(2);
    await userEvent.click(c.getByRole('button', { name: 'Page 3' }));
    await expect(c.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
  },
};

export const FirstPage: Story = {
  render: (args) => <PagedPagination initial={1} total={args.total} pageSize={args.pageSize} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await expect(c.getByRole('button', { name: 'Next page' })).toBeEnabled();
  },
};

export const LastPage: Story = {
  render: (args) => <PagedPagination initial={10} total={args.total} pageSize={args.pageSize} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Page 10 of 10')).toBeInTheDocument();
    await expect(c.getByRole('button', { name: 'Next page' })).toBeDisabled();
    await expect(c.getByRole('button', { name: 'Previous page' })).toBeEnabled();
  },
};

export const MiddleWithGaps: Story = {
  name: 'Middle page (gaps both sides)',
  render: () => <PagedPagination initial={10} total={400} pageSize={10} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'Page 10' })).toHaveAttribute('aria-current', 'page');
    await expect(c.getByRole('button', { name: 'Page 9' })).toBeInTheDocument();
    await expect(c.queryByRole('button', { name: 'Page 5' })).toBeNull();
  },
};

export const FewPages: Story = {
  name: 'Few pages (all numbers, no gaps)',
  render: () => <PagedPagination initial={2} total={45} pageSize={10} />,
};

export const SinglePage: Story = {
  name: 'Single page (renders nothing)',
  render: () => (
    <div>
      <PagedPagination initial={1} total={8} pageSize={10} />
      <p className="caption-muted">Eight rows at ten per page: no pagination bar is drawn.</p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('navigation', { name: 'Pagination' })).toBeNull();
  },
};

export const KeyboardNavigation: Story = {
  render: (args) => <PagedPagination initial={3} total={args.total} pageSize={args.pageSize} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    c.getByRole('button', { name: 'Previous page' }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(c.getByText('Page 2 of 10')).toBeInTheDocument();
    await userEvent.tab();
    await expect(c.getByRole('button', { name: 'Page 1' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(c.getByText('Page 1 of 10')).toBeInTheDocument();
  },
};

export const Hover: Story = {
  render: () => <PagedPagination initial={2} total={95} pageSize={10} />,
  play: async ({ canvasElement }) => {
    // On page 2 of 10 the pager shows pages 1-3 then 8-10.
    await userEvent.hover(within(canvasElement).getByRole('button', { name: 'Page 3' }));
  },
};

export const Focus: Story = {
  render: () => <PagedPagination initial={2} total={95} pageSize={10} />,
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button', { name: 'Previous page' })).toHaveFocus();
  },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
  render: () => <PagedPagination initial={5} total={400} pageSize={10} />,
};

export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
  render: () => <PagedPagination initial={5} total={400} pageSize={10} />,
};

const ROWS = Array.from({ length: 47 }, (_, i) => `Row ${i + 1}`);

function PagedList({ rows }: { rows: string[] }) {
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? rows : rows.filter((_, i) => i % 2 === 0);
  const p = usePagination(shown, 10, filter);
  return (
    <div className="stack gap-3">
      <div className="cluster gap-2">
        <Button variant="secondary" size="sm" onClick={() => setFilter('all')}>All rows</Button>
        <Button variant="secondary" size="sm" onClick={() => setFilter('even')}>Odd-numbered rows only</Button>
      </div>
      <p className="caption-muted">Showing {p.from}-{p.to} of {p.total}</p>
      <ul>{p.slice.map((r) => <li key={r}>{r}</li>)}</ul>
      <Pagination page={p.page} total={p.total} pageSize={p.pageSize} onPage={p.setPage} />
    </div>
  );
}

export const WithUsePagination: Story = {
  name: 'usePagination (a paged list)',
  render: () => <PagedList rows={ROWS} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Showing 1-10 of 47')).toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Page 5' }));
    await expect(c.getByText('Showing 41-47 of 47')).toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Odd-numbered rows only' }));
    await expect(c.getByText('Showing 1-10 of 24')).toBeInTheDocument();
  },
};
