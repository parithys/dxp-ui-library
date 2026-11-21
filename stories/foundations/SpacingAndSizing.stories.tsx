import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Section, TOKENS, readToken, useTheme } from './tokenSource';

/** A bar whose width is the token itself; the pixel width is MEASURED from the rendered element, not restated. */
function Bar({ name, axis }: { name: string; axis: 'width' | 'height' }) {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const [px, setPx] = useState('');
  useEffect(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPx(`${Math.round((axis === 'width' ? r.width : r.height) * 10) / 10}px`);
  }, [theme, axis, name]);
  return (
    <div className="row-between row-rule gap-4 py-2">
      <span className="stack gap-0"><code className="code-chip">{name}</code><span className="caption-muted">{readToken(name)} = {px}</span></span>
      <div className="w-full max-w-md overflow-hidden">
        <div ref={ref} className="bg-accent" style={axis === 'width' ? { width: `var(${name})`, maxWidth: '100%', height: '0.75rem' } : { height: `var(${name})`, width: '0.75rem' }} />
      </div>
    </div>
  );
}

const sizeTokens = () => TOKENS.filter((t) => t.name.startsWith('--size-'));

function Sizes() {
  // A size token may be a width, a height or a min/max of either; the bar draws it as a width, capped to the box, so wide ones read as "full".
  return <div className="stack gap-0">{sizeTokens().map((t) => <Bar key={t.name} name={t.name} axis="width" />)}</div>;
}

function ControlHeights() {
  const names = ['--control-h-sm', '--control-h-md', '--control-h-lg'];
  return (
    <div className="stack gap-4">
      {names.map((n) => <Bar key={n} name={n} axis="height" />)}
      <p className="caption-muted">The same heights on a real Button in each size (Button size sm / md / lg read these tokens):</p>
      <div className="cluster gap-4">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
      <p className="caption-muted">
        <code className="code-chip">--field-height</code> (= <code className="code-chip">--control-h-md</code>) is the height of every single-line field; <code className="code-chip">--touch-target</code> is the
        44px minimum a finger must hit, read only by tablet.css.
      </p>
    </div>
  );
}

function Spacing() {
  const steps = [1, 2, 3, 4, 5, 6, 8, 10, 12];
  return (
    <div className="stack gap-4">
      <p className="body-text">
        One spacing step is <code className="code-chip">--space-unit</code> ({readToken('--space-unit')}); Tailwind&apos;s spacing scale is bound to it in index.css, so <code className="code-chip">p-4</code>,
        <code className="code-chip">gap-3</code> and friends are multiples of it. Each bar below is the unit multiplied by its step.
      </p>
      <div className="stack gap-2">
        {steps.map((n) => (
          <div key={n} className="row gap-4">
            <code className="code-chip">gap-{n} / p-{n}</code>
            <div className="h-3 bg-accent" style={{ width: `calc(var(--space-unit) * ${n})` }} />
            <span className="caption-muted">{n} x unit</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Literal class names (Tailwind only generates utilities it can read in the source).
const GAPS: [number, string][] = [[1, 'row gap-1'], [2, 'row gap-2'], [4, 'row gap-4'], [6, 'row gap-6']];

function PadClasses() {
  return (
    <div className="stack gap-4">
      <p className="caption-muted">Padding classes: <code className="code-chip">.pad-row</code> (px-4 py-3), <code className="code-chip">.pad-panel</code> (px-5 py-4), <code className="code-chip">.pad-card-lg</code> (px-6 py-5). Outlines are the content box.</p>
      {(['pad-row', 'pad-panel', 'pad-card-lg'] as const).map((c) => (
        <div key={c} className="stack gap-1">
          <code className="code-chip">.{c}</code>
          <div className="card"><div className={`${c} bg-surface`}><div className="body-text">Content</div></div></div>
        </div>
      ))}
      <p className="caption-muted">Gaps are Tailwind <code className="code-chip">gap-*</code> utilities on the layout classes (<code className="code-chip">.row gap-2</code>, <code className="code-chip">.stack gap-6</code>).</p>
      {GAPS.map(([g, cls]) => (
        <div key={g} className={cls}><code className="code-chip">gap-{g}</code>{[1, 2, 3].map((i) => <span key={i} className="card pad-row">Box {i}</span>)}</div>
      ))}
    </div>
  );
}

function Scales() {
  const names = TOKENS.filter((t) => /^--(z-|motion-|ease-|tab-)/.test(t.name));
  return (
    <div className="card overflow-x-auto"><table className="w-full text-left"><thead><tr className="row-rule caption-heading"><th className="pad-row">Token</th><th className="pad-row">Value</th></tr></thead>
      <tbody>{names.map((t) => <tr key={t.name} className="row-rule"><td className="pad-row"><code className="code-chip">{t.name}</code></td><td className="pad-row caption-secondary">{readToken(t.name)}</td></tr>)}</tbody></table></div>
  );
}

const meta = {
  title: 'Foundations/Spacing and Sizing',
  parameters: {
    ...docsParameters({
      purpose: 'Spacing steps, padding and gap conventions, control heights and the named layout sizes. Lengths live in tokens.css and are read with var(); a component never carries a literal length.',
      source: 'src/styles/tokens.css (--space-unit, --size-*, --control-h-*, --field-height, --touch-target), src/styles/components.css (.pad-*)',
      usage: ['Use `.pad-row` / `.pad-panel` / `.pad-card-lg` for standard padding and `gap-*` utilities on layout classes.', 'A new fixed length is added to tokens.css as `--size-*` and read with `var()`.'],
      devices: ['On Tablet `--control-h-sm/md/lg` grow (see Themes and Device); the --size-* tokens do not change.'],
    }),
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const SpacingScale: Story = { render: () => <Section title="Spacing scale"><Spacing /></Section> };
export const PaddingAndGap: Story = { render: () => <Section title="Padding and gap classes"><PadClasses /></Section> };
export const ControlHeightTokens: Story = { render: () => <Section title="Control heights"><ControlHeights /></Section> };
export const SizeTokens: Story = { render: () => <Section title="Named sizes (--size-*)" note="Drawn as widths and measured; a token that is really a height or a max/min shows its value in the label."><Sizes /></Section> };
export const StackingAndMotion: Story = { render: () => <Section title="Stacking, motion and tab-strip scales"><Scales /></Section> };
