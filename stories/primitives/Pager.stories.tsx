import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Pager } from '../../src';
import { pageItems } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Column, Specimen } from '../_shared/layout';

function PagedPager(props: { initial: number; pages: number; onPage?: (p: number) => void }) {
  const [page, setPage] = useState(props.initial);
  return <Pager page={page} pages={props.pages} onPage={(p) => { setPage(p); props.onPage?.(p); }} />;
}

const meta = {
  title: 'Navigation/Pager',
  component: Pager,
  parameters: {
    ...docsParameters({
      purpose: 'The bordered Previous / page numbers / Next group, the current page in the Primary button style. Pagination adds the "Page a of b" label around it; use Pager alone when no label is wanted.',
      source: 'src/components/primitives/Pager.tsx, pagerModel.ts',
      states: [
        'Current page: `aria-current="page"`. First page: Previous disabled. Last page: Next disabled.',
        'More than 7 pages: first three, last three and the current page with neighbours, with "..." gaps.',
        'One page or none renders nothing.',
      ],
      events: ['onPage(page): the new 1-based page.'],
      usage: ['Pages are 1-based. It is controlled: keep `page` in state and update it from `onPage`.'],
      accessibility: ['A nav named "Pagination"; buttons are named "Previous page", "Next page" and "Page n"; the "..." gaps are `aria-hidden`; Tab moves through the buttons, Enter / Space activate.'],
      devices: ['Control heights follow the --control-h tokens, which the tablet rules scale.'],
    }),
  },
  argTypes: {
    page: { control: { type: 'number', min: 1 }, description: '1-based current page.' },
    pages: { control: { type: 'number', min: 0 }, description: 'Total number of pages.' },
    onPage: { control: false },
    className: { control: false },
  },
  args: { page: 1, pages: 7, onPage: fn() },
} satisfies Meta<typeof Pager>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <PagedPager initial={args.page} pages={args.pages} onPage={args.onPage} />,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Page 7' }));
    await expect(args.onPage).toHaveBeenCalledWith(7);
    await expect(c.getByRole('button', { name: 'Next page' })).toBeDisabled();
  },
};

export const FirstPage: Story = {
  render: () => <PagedPager initial={1} pages={10} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await expect(c.getByRole('button', { name: 'Next page' })).toBeEnabled();
  },
};

export const LastPage: Story = {
  render: () => <PagedPager initial={10} pages={10} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'Next page' })).toBeDisabled();
    await expect(c.getByRole('button', { name: 'Previous page' })).toBeEnabled();
  },
};

export const SinglePage: Story = {
  name: 'Single page (renders nothing)',
  render: () => <PagedPager initial={1} pages={1} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('navigation', { name: 'Pagination' })).toBeNull();
  },
};

export const KeyboardNavigation: Story = {
  render: () => <PagedPager initial={3} pages={10} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    c.getByRole('button', { name: 'Previous page' }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(c.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  },
};

export const Hover: Story = {
  render: () => <PagedPager initial={2} pages={10} />,
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button', { name: 'Page 3' }));
  },
};

export const Focus: Story = {
  render: () => <PagedPager initial={2} pages={10} />,
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button', { name: 'Previous page' })).toHaveFocus();
  },
};

export const AllWindows: Story = {
  name: 'Page windows by size',
  render: () => (
    <Column>
      {[3, 7, 8, 20].map((n) => (
        <Specimen key={n} label={`${n} pages, current ${Math.ceil(n / 2)}: ${pageItems(Math.ceil(n / 2), n).join(' ')}`}>
          <Pager page={Math.ceil(n / 2)} pages={n} onPage={() => undefined} />
        </Specimen>
      ))}
    </Column>
  ),
};
