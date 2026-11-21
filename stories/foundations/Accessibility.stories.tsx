import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button, Input } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Section, readToken, useTheme } from './tokenSource';

type Rgb = [number, number, number];

/** Reads a token's colour as the browser resolves it (a probe element), in sRGB 0..255; undefined when the format is not understood. */
function resolveRgb(token: string): Rgb | undefined {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  const nums = value.match(/-?\d*\.?\d+/g)?.map(Number);
  if (!nums || nums.length < 3) return undefined;
  if (value.startsWith('color(')) return [nums[0] * 255, nums[1] * 255, nums[2] * 255];
  if (value.startsWith('rgb')) return [nums[0], nums[1], nums[2]];
  return undefined;
}

const lum = ([r, g, b]: Rgb) => {
  const f = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a: Rgb, b: Rgb) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

const PAIRS: [string, string, string][] = [
  ['--field-border', '--bg', 'Field edge on the page'],
  ['--field-border', '--surface', 'Field edge on a grey surface'],
  ['--field-border', '--field-card-border', 'Field edge vs card edge'],
  ['--focus-outline', '--bg', 'Focus outline on the page'],
  ['--fg', '--bg', 'Body text on the page'],
  ['--muted', '--bg', 'Muted text on the page'],
  ['--field-border-error', '--bg', 'Error edge / text on the page'],
];

function Contrast() {
  const theme = useTheme();
  const [rows, setRows] = useState<{ label: string; a: string; b: string; r?: number }[]>([]);
  useEffect(() => {
    setRows(PAIRS.map(([a, b, label]) => {
      const ca = resolveRgb(a);
      const cb = resolveRgb(b);
      return { label, a, b, r: ca && cb ? ratio(ca, cb) : undefined };
    }));
  }, [theme]);
  return (
    <div className="stack gap-3">
      <p className="body-text">Measured from the live tokens for the toolbar theme (<strong>{theme}</strong>). Non-text UI (field borders, focus indicator) needs 3:1 (WCAG 1.4.11); text needs 4.5:1. The e2e suite (<code className="code-chip">e2e/a11y.spec.ts</code>) pins the field-border and focus checks in both themes.</p>
      <div className="card overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr className="row-rule caption-heading"><th className="pad-row">Pair</th><th className="pad-row">Tokens</th><th className="pad-row">Ratio</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.label} className="row-rule"><td className="pad-row">{r.label}</td><td className="pad-row"><code className="code-chip">{r.a}</code> on <code className="code-chip">{r.b}</code></td><td className="pad-row value-text">{r.r ? `${r.r.toFixed(2)} : 1` : 'not measurable here'}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function FocusDemo() {
  const theme = useTheme();
  return (
    <div className="stack gap-4">
      <p className="body-text">
        Every keyboard-operable control shows a visible focus indicator: <code className="code-chip">:focus-visible</code> is a real 2px <em>outline</em> (it survives forced-colours mode and is not clipped) in
        <code className="code-chip">--focus-outline</code> - teal in light, <code className="code-chip">--fg</code> in dark, not teal. Text inputs are the one exception by design: their own border and fill change
        (<code className="code-chip">--field-focus-border</code>, <code className="code-chip">--field-focus-bg</code>) is the indicator. Now: <strong>{theme}</strong>, <code className="code-chip">--focus-outline</code> = <code className="code-chip">{readToken('--focus-outline')}</code>.
        Press Tab to move through the controls below.
      </p>
      <div className="cluster gap-4">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="tertiary">Tertiary</Button>
        <a href="#focus" className="link focus-ring">A text link</a>
        <button type="button" className="link-action">Link-style button</button>
      </div>
      <div className="grid-2-up gap-4"><Input label="Text field" defaultValue="Focus me" /><Input label="Field with error" error="This value is not valid" defaultValue="x" /></div>
    </div>
  );
}

function TapTargets() {
  const refs = [useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null)];
  const [sizes, setSizes] = useState<string[]>([]);
  const theme = useTheme();
  useEffect(() => {
    setSizes(refs.map((r) => (r.current ? `${Math.round(r.current.getBoundingClientRect().height)}px` : '')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);
  return (
    <div className="stack gap-3">
      <p className="body-text">
        Anything a finger must hit is at least <code className="code-chip">--touch-target</code> (= {readToken('--touch-target')}, 44px) on a tablet: tablet.css lifts the small controls to it and
        <code className="code-chip">[data-device=&apos;tablet&apos;]</code> grows <code className="code-chip">--control-h-sm/md/lg</code>. Measured heights now (switch Device to Tablet to compare):
      </p>
      <div className="cluster gap-4 items-end">
        {(['sm', 'md', 'lg'] as const).map((s, i) => <div key={s} className="stack-center gap-1"><Button ref={refs[i]} size={s}>{s}</Button><span className="caption-muted">{sizes[i]}</span></div>)}
      </div>
    </div>
  );
}

const meta = {
  title: 'Foundations/Accessibility',
  parameters: {
    ...docsParameters({
      purpose: 'The accessibility rules the design system guarantees: focus indicator, field-border contrast and tap targets. Components inherit them from tokens and base styles; do not weaken them to pass a migration.',
      source: 'src/styles/preset.css (:focus-visible), src/styles/tokens.css (--focus-outline, --field-border), src/styles/components.css',
      accessibility: ['Focus ring: teal in light, --fg in dark; field borders meet 3:1 in both themes; disabled controls use native `disabled`; radio groups keep role=radiogroup / radio / aria-checked; validation errors are tied to their field (aria-invalid, aria-describedby, role=alert).'],
    }),
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const FocusRing: Story = {
  render: () => <Section title="Focus indicator"><FocusDemo /></Section>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Primary' })).toHaveFocus();
  },
};
export const FieldBorderContrast: Story = { render: () => <Section title="Contrast"><Contrast /></Section> };
export const TapTargetSizes: Story = { render: () => <Section title="Tap targets"><TapTargets /></Section> };
