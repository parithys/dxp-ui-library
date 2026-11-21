import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DataTable, type Column, Input } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Column as Stack, Specimen } from '../_shared/layout';
import map from './primitivesMap.json';

// The files in src/components/primitives, read from the source tree at build time - so a file added there shows up here at once, as "Not classified".
// (A lazy glob: only the names are read; nothing is loaded.)
const SOURCE = import.meta.glob('../../src/components/primitives/*');
const FILES = Object.keys(SOURCE).map((p) => p.split('/').pop() as string).sort((a, b) => a.localeCompare(b));

type Kind = 'page' | 'section' | 'internal' | 'helper' | 'style' | 'unclassified';
interface Entry { kind: Kind; story?: string; note?: string }
const ENTRIES = map as Record<string, Entry>;

const KIND_LABEL: Record<Kind, string> = {
  page: 'Reusable primitive - own page',
  section: 'Reusable primitive - shown inside another page',
  internal: 'Internal implementation',
  helper: 'Supporting helper (model, data, context)',
  style: 'Styling / tokens',
  unclassified: 'Not classified - add it to primitivesMap.json',
};

/** Storybook's own id for a title: lower-case words joined with `-`. */
const slug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const docsHref = (title: string) => `/?path=/docs/${slug(title)}--docs`;

interface Row { file: string; kind: Kind; story?: string; note?: string }
const ROWS: Row[] = FILES.map((file) => ({ file, ...(ENTRIES[file] ?? { kind: 'unclassified' as Kind }) }));

const COLUMNS: Column<Row>[] = [
  { key: 'file', header: 'File', strong: true },
  { key: 'kind', header: 'What it is', render: (r) => KIND_LABEL[r.kind] },
  {
    key: 'story',
    header: 'Where in Storybook',
    // A link into the Storybook sidebar (the preview is an iframe: the link must act on the whole window).
    render: (r) => (r.story ? <a className="link" href={docsHref(r.story)} target="_top">{r.story}</a> : <span className="caption-muted">No story needed</span>),
  },
  { key: 'note', header: 'Note', render: (r) => <span className="caption-muted">{r.note ?? ''}</span> },
];

function Counts() {
  const kinds = Object.keys(KIND_LABEL) as Kind[];
  return (
    <div className="cluster gap-6">
      {kinds.map((k) => (
        <Specimen key={k} label={KIND_LABEL[k]}>
          <p className="title title-lg">{ROWS.filter((r) => r.kind === k).length}</p>
        </Specimen>
      ))}
    </div>
  );
}

function PrimitivesMap() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const rows = q ? ROWS.filter((r) => `${r.file} ${KIND_LABEL[r.kind]} ${r.story ?? ''} ${r.note ?? ''}`.toLowerCase().includes(q)) : ROWS;
  return (
    <Stack>
      <Counts />
      <Input label="Filter" placeholder="" value={query} onChange={(e) => setQuery(e.target.value)} helperText={`${rows.length} of ${ROWS.length} files in src/components/primitives`} />
      <DataTable columns={COLUMNS} rows={rows} rowKey={(r) => r.file} emptyMessage="No file matches the filter." />
    </Stack>
  );
}

const meta = {
  title: 'Foundations/Primitives Map',
  component: PrimitivesMap,
  parameters: {
    layout: 'fullscreen',
    ...docsParameters({
      purpose:
        'Every file in `src/components/primitives`, what kind of file it is, and where it appears in this Storybook. The sidebar is organised by role in the application (Forms, Navigation, Feedback & Status ...), not by source folder, so a primitive is found where it is used: this page maps the folder to the sidebar.',
      source: 'src/components/primitives (file list read from the source tree) and stories/foundations/primitivesMap.json (the classification)',
      variants: [
        'Reusable primitive - own page: a page in the sidebar.',
        'Reusable primitive - shown inside another page: a section of a sibling\'s page (CloseButton on Icon Button, Pager on Pagination ...).',
        'Internal implementation: not used on its own (OverlayPortal).',
        'Supporting helper: models, data and React contexts used by a primitive.',
        'Styling / tokens: CSS that belongs to a primitive.',
      ],
      usage: [
        'A new file in `src/components/primitives` appears here as "Not classified" until it is added to `primitivesMap.json`; the `npm test` guard (tests/storybookStories.test.mjs) fails until it is.',
        'The links open the component\'s docs page in the sidebar.',
      ],
    }),
  },
} satisfies Meta<typeof PrimitivesMap>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PrimitivesMap />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Every file of the folder is listed, none is left unclassified, and the filter narrows the table.
    await expect(await canvas.findByText('Modal.tsx')).toBeVisible();
    // (The counts row above the table also carries the 'Not classified' label, with a count of 0, so look at the table's cells only.)
    await expect(canvas.queryAllByRole('cell').filter((c: HTMLElement) => /Not classified/.test(c.textContent ?? ''))).toHaveLength(0);
    await userEvent.type(canvas.getByLabelText('Filter'), 'tooltip');
    await expect(canvas.queryByText('Modal.tsx')).toBeNull();
    await expect(canvas.getByText('Tooltip.tsx')).toBeVisible();
  },
};
