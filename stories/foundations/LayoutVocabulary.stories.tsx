import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { docsParameters } from '../_shared/docs';
import { Section } from './tokenSource';

/** A placeholder: the app's own card with row padding. */
const Box = ({ children, tall }: { children: ReactNode; tall?: boolean }) => <div className={tall ? 'card pad-panel py-8' : 'card pad-row'}>{children}</div>;

interface Demo { cls: string; note: string; count?: number; tall?: boolean; extra?: string }

const DEMOS: { title: string; demos: Demo[] }[] = [
  {
    title: 'Rows',
    demos: [
      { cls: 'row gap-3', note: 'Flex row, items centred, gap-3. Add a gap-* utility to change the gap (the old .row-tight does not exist).' },
      { cls: 'row row-start', note: '.row-start: items aligned to the top.', tall: true },
      { cls: 'row-baseline', note: 'Items aligned on the text baseline.' },
      { cls: 'row-between', note: 'Flex row, space between, items centred.', count: 2 },
      { cls: 'split', note: 'Wrapping row, space between, gap-3: a label left and a value or action right.', count: 2 },
      { cls: 'split-top', note: 'Space between, items aligned to the top.', count: 2, tall: true },
      { cls: 'spread', note: 'Flex, justify between, gap-4.', count: 2 },
      { cls: 'actions-end', note: 'Buttons pushed to the right, gap-2 (form and dialog footers).', count: 2 },
    ],
  },
  {
    title: 'Wrapping groups and stacks',
    demos: [
      { cls: 'cluster gap-3', note: '.cluster: wrapping row for chips, badges, buttons.', count: 6 },
      { cls: 'stack', note: '.stack: vertical, gap-3.' },
      { cls: 'stack-start', note: '.stack-start: vertical, items left, gap-4.' },
      { cls: 'stack-center', note: '.stack-center: vertical, items centred.' },
      { cls: 'stack-middle', note: '.stack-middle: centred both ways, gap-3.' },
    ],
  },
  {
    title: 'Grids',
    demos: [
      { cls: 'fields', note: '.fields: one column, gap-4 (form fields).' },
      { cls: 'fields-2', note: '.fields-2: one column on small screens, two from the sm breakpoint.', count: 4 },
      { cls: 'fields-3', note: '.fields-3: three columns from the sm breakpoint.', count: 6 },
      { cls: 'fields-sm', note: '.fields-sm: one column, tighter (gap-3).' },
      { cls: 'grid-2-up', note: '.grid-2-up: two equal columns from sm, gap-4.', count: 4 },
      { cls: 'grid-2-up-sm', note: '.grid-2-up-sm: the tighter two-up.', count: 4 },
      { cls: 'two-col-top', note: '.two-col-top: two columns from lg, items top-aligned (use for cards of different heights).', count: 2, tall: true },
    ],
  },
];

function DemoBlock({ d }: { d: Demo }) {
  const n = d.count ?? 3;
  return (
    <div className="stack gap-2">
      <code className="code-chip">.{d.cls}</code>
      <p className="caption-muted">{d.note}</p>
      <div className="pad-row bg-surface">
        <div className={d.cls}>
          {Array.from({ length: n }, (_, i) => <Box key={i} tall={d.tall && i === 0}>Item {i + 1}</Box>)}
        </div>
      </div>
    </div>
  );
}

function Padding() {
  return (
    <div className="stack gap-3">
      {[['pad-row', 'px-4 py-3: list rows, table cells'], ['pad-panel', 'px-5 py-4: panels'], ['pad-card-lg', 'px-6 py-5: large cards']].map(([c, n]) => (
        <div key={c} className="stack gap-1"><code className="code-chip">.{c}</code><p className="caption-muted">{n}</p><div className="bg-surface"><div className={c}><div className="card pad-row">Content</div></div></div></div>
      ))}
    </div>
  );
}

const meta = {
  title: 'Foundations/Layout Vocabulary',
  parameters: {
    ...docsParameters({
      purpose: 'The application\'s layout classes, shown with plain placeholder boxes. Compose screens from these (plus gap-* / margin utilities at the call site) instead of long utility strings.',
      source: 'src/styles/components.css (layout vocabulary)',
      usage: ['A className may carry at most three utility classes; anything repeated becomes a semantic class in ui-components.css (a test enforces the budget).', 'One-off layout (margins, widths) stays a utility at the call site.', 'The grids switch to columns at Tailwind breakpoints (`sm`, `lg`): resize the canvas or use the viewport toolbar to see them stack.'],
    }),
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const RowsAndSplits: Story = { render: () => <Section title={DEMOS[0].title}><div className="stack gap-6">{DEMOS[0].demos.map((d) => <DemoBlock key={d.cls} d={d} />)}</div></Section> };
export const StacksAndClusters: Story = { render: () => <Section title={DEMOS[1].title}><div className="stack gap-6">{DEMOS[1].demos.map((d) => <DemoBlock key={d.cls} d={d} />)}</div></Section> };
export const Grids: Story = { render: () => <Section title={DEMOS[2].title}><div className="stack gap-6">{DEMOS[2].demos.map((d) => <DemoBlock key={d.cls} d={d} />)}</div></Section> };
export const PaddingClasses: Story = { render: () => <Section title="Padding"><Padding /></Section> };
export const Mobile: Story = { ...Grids, parameters: { viewport: { defaultViewport: 'mobile' } } };
