import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Icon } from '../../src';
import * as navigation from '../../src/assets/icons/navigation';
import * as actions from '../../src/assets/icons/actions';
import * as status from '../../src/assets/icons/status';
import * as objects from '../../src/assets/icons/objects';
import { docsParameters } from '../_shared/docs';
import { FilterBox, Section } from './tokenSource';

interface Entry { name: string; path: string }
interface IconGroup { id: string; file: string; entries: Entry[] }

const fromModule = (mod: Record<string, unknown>): Entry[] =>
  Object.entries(mod).filter((e): e is [string, string] => typeof e[1] === 'string').map(([name, path]) => ({ name, path }));

const GROUPS: IconGroup[] = [
  { id: 'navigation', file: 'navigation.ts', entries: fromModule(navigation) },
  { id: 'actions', file: 'actions.ts', entries: fromModule(actions) },
  { id: 'status', file: 'status.ts', entries: fromModule(status) },
  { id: 'objects', file: 'objects.ts', entries: fromModule(objects) },
];

function copyName(name: string) {
  try {
    void navigator.clipboard?.writeText(name);
  } catch {
    /* clipboard blocked: the name is still shown */
  }
}

function IconTile({ entry, onCopy }: { entry: Entry; onCopy: (n: string) => void }) {
  return (
    <button type="button" className="card card-button stack-center gap-2 focus-ring" aria-label={`Copy ${entry.name}`} onClick={() => onCopy(entry.name)}>
      <Icon path={entry.path} className="w-8 h-8" />
      <span className="caption-muted break-all text-center">{entry.name}</span>
    </button>
  );
}

function Gallery({ only }: { only?: string }) {
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState('');
  const groups = useMemo(() => GROUPS.filter((g) => !only || g.id === only), [only]);
  const q = query.trim().toLowerCase();
  const onCopy = (n: string) => {
    copyName(n);
    setCopied(n);
  };
  return (
    <div className="stack gap-6">
      <FilterBox value={query} onChange={setQuery} label="Filter icons by name" />
      <p className="caption-muted" role="status">{copied ? `Copied ${copied}` : 'Click an icon to copy its export name.'}</p>
      {groups.map((g) => {
        const shown = g.entries.filter((e) => !q || e.name.toLowerCase().includes(q));
        return (
          <Section key={g.id} title={`${g.file} (${shown.length})`}>
            <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(7rem,1fr))]">
              {shown.map((e) => <IconTile key={`${g.id}-${e.name}`} entry={e} onCopy={onCopy} />)}
            </div>
          </Section>
        );
      })}
    </div>
  );
}

const SIZES = [['icon-2xs', 'icon-2xs'], ['icon-xs', 'icon-xs'], ['icon-sm', 'icon-sm'], ['icon-md', 'icon-md']] as const;
const TONES = [['text-fg', 'text-fg'], ['text-fg-2', 'text-fg-2'], ['text-muted', 'text-muted'], ['text-accent', 'text-accent'], ['text-success', 'text-success'], ['text-danger', 'text-danger'], ['text-warn', 'text-warn'], ['text-info', 'text-info'], ['text-link', 'text-link']] as const;

function SizesAndTones() {
  const sample = objects.SIM;
  return (
    <div className="stack gap-6">
      <Section title="Sizes" note="The Icon primitive's className sets the size; the .icon-* classes are the app's sizes. The default (w-5 h-5) is the same as .icon-md.">
        <div className="cluster gap-6">
          {SIZES.map(([cls, label]) => <div key={cls} className="stack-center gap-2"><Icon path={sample} className={cls} /><code className="code-chip">.{label}</code></div>)}
        </div>
      </Section>
      <Section title="Tones" note="Icons draw with currentColor: the tone is the text colour of the element, set with a text-* token class.">
        <div className="cluster gap-6">
          {TONES.map(([cls, label]) => <div key={cls} className="stack-center gap-2"><span className={cls}><Icon path={sample} className="icon-md" /></span><code className="code-chip">{label}</code></div>)}
        </div>
      </Section>
    </div>
  );
}

const meta = {
  title: 'Foundations/Icons',
  component: Icon,
  parameters: {
    ...docsParameters({
      purpose: 'Every icon exported from src/assets/icons, drawn by the one Icon primitive. An icon is a 24px-grid stroke path; the path string lives only in src/assets/icons and is passed to Icon.',
      source: 'src/assets/icons/{navigation,actions,status,objects}.ts, src/components/primitives/Icon.tsx',
      usage: ['Import the constant from `src/assets/icons`; never write a path string in a component.', 'Add an icon as one `export const NAME` in the right file; a test fails on a duplicate name or a path under two names.', 'Step and journey icons are looked up by key (`stepIcon(key)`, `journeyIcon(id, fallback)`); a key without an entry falls back to a generic icon.'],
      accessibility: ['Icons are decorative SVGs (no title); a control that holds only an icon needs an `aria-label` (Button ghost + icon requires one).'],
    }),
  },
  argTypes: {
    path: { control: 'text', description: 'The SVG path data (an export of src/assets/icons).' },
    className: { control: 'text', description: 'Size class: icon-2xs, icon-xs, icon-sm, icon-md (default w-5 h-5).' },
    strokeWidth: { control: 'number', description: 'Stroke width (default 2; set once in Icon).' },
  },
  args: { path: objects.SIM, className: 'icon-md' },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AllIcons: Story = { render: () => <Gallery /> };
export const Navigation: Story = { render: () => <Gallery only="navigation" /> };
export const Actions: Story = { render: () => <Gallery only="actions" /> };
export const Status: Story = { render: () => <Gallery only="status" /> };
export const Objects: Story = { render: () => <Gallery only="objects" /> };
export const SizesAndTonesStory: Story = { name: 'Sizes and tones', render: () => <SizesAndTones /> };
export const Search: Story = {
  render: () => <Gallery only="navigation" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = await canvas.findByRole('searchbox', { name: 'Filter icons by name' });
    await userEvent.type(box, 'zzzz-no-such-icon');
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
  },
};
