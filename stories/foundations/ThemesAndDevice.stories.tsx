import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Card, Badge, Input } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Section, TOKENS, readToken, useTheme } from './tokenSource';

/** The same real components, used by every comparison below. */
function Specimens() {
  return (
    <Card className="pad-panel stack gap-4">
      <p className="title title-md">Customer details</p>
      <Input label="Full name" defaultValue="Aisha Al-Thani" />
      <Input label="Mobile number" defaultValue="" error="Enter a number" />
      <div className="cluster gap-2">
        <Badge variant="success">Active</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="danger">Blocked</Badge>
        <Badge variant="info">Info</Badge>
      </div>
      <div className="actions-end">
        <Button variant="secondary" size="md">Cancel</Button>
        <Button size="md">Save</Button>
      </div>
    </Card>
  );
}

function ThemeDiff() {
  const theme = useTheme();
  const changed = TOKENS.filter((t) => t.dark !== undefined);
  return (
    <div className="stack gap-6">
      <p className="body-text">
        Theme now: <strong>{theme}</strong>. Use the toolbar <strong>Theme</strong> switch: it toggles the <code className="code-chip">dark</code> class on <code className="code-chip">&lt;html&gt;</code>, exactly as the
        app does, and <code className="code-chip">tokens.css</code> redefines {changed.length} custom properties under <code className="code-chip">:root.dark</code> (structural surfaces, text, borders, field chrome, status colours, elevation). Components
        carry no dark-specific code: they read tokens, so the specimen below recolours as a whole. The dark class is document-wide, so light and dark are compared by switching the toolbar rather than side by side in one canvas.
      </p>
      <Specimens />
    </div>
  );
}

function Measure({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [facts, setFacts] = useState('');
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    setFacts(['--control-h-sm', '--control-h-md', '--control-h-lg', '--touch-target'].map((n) => `${n.slice(2)}: ${cs.getPropertyValue(n).trim()}`).join('  |  '));
  }, []);
  return (
    <div ref={ref} className="stack gap-1">
      <p className="eyebrow">{label}</p>
      <p className="caption-muted">{facts}</p>
    </div>
  );
}

function Controls() {
  return (
    <div className="stack gap-4">
      <div className="cluster gap-3 items-end">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
      <Input label="Field (height = --field-height)" defaultValue="Sample" />
    </div>
  );
}

function WebVsTablet() {
  return (
    <div className="stack gap-6">
      <p className="body-text">
        A subtree marked <code className="code-chip">data-device=&quot;tablet&quot;</code> redefines the control-height tokens for everything inside it - the same mechanism a touch journey uses on its root. Left: default. Right: the same components inside a
        <code className="code-chip">data-device=&quot;tablet&quot;</code> wrapper. The toolbar <strong>Device</strong> switch applies the same attribute to the whole page and makes the app&apos;s own device detection
        (<code className="code-chip">lib/deviceType.ts</code>) report Tablet.
      </p>
      <div className="grid-2-up gap-6 items-start">
        <div className="card pad-panel stack gap-4"><Measure label="Web (pointer)" /><Controls /></div>
        <div data-device="tablet" className="card pad-panel stack gap-4"><Measure label="Tablet (data-device=tablet)" /><Controls /></div>
      </div>
    </div>
  );
}

function WhatChanges() {
  useTheme();
  const tablet = TOKENS.filter((t) => t.tablet !== undefined);
  return (
    <div className="stack gap-4">
      <p className="body-text">What <code className="code-chip">[data-device=&apos;tablet&apos;]</code> changes in <code className="code-chip">src/styles/tokens.css</code> (read from the file):</p>
      <div className="card overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr className="row-rule caption-heading"><th className="pad-row">Token</th><th className="pad-row">Web</th><th className="pad-row">Tablet</th><th className="pad-row">Live now</th></tr></thead>
          <tbody>
            {tablet.map((t) => (
              <tr key={t.name} className="row-rule"><td className="pad-row"><code className="code-chip">{t.name}</code></td><td className="pad-row">{t.light ?? '-'}</td><td className="pad-row">{t.tablet}</td><td className="pad-row caption-muted">{readToken(t.name)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="body-text">
        <code className="code-chip">src/styles/tokens.css</code> adds, scoped to <code className="code-chip">[data-device=&apos;tablet&apos;]</code> and unlayered so it beats call-site utilities: a <code className="code-chip">--touch-target</code> (44px) minimum
        size for header and nav icon buttons, pager buttons, tabs, sort buttons, tertiary buttons, truncated links, select chevrons and breadcrumbs; a finger-sized hit area around <code className="code-chip">Copy</code> icon buttons; equal-width auto-fill
        dashboard tiles (<code className="code-chip">.tile-grid</code>); wider drawers (<code className="code-chip">.drawer-panel</code>); dialogs sized to the visible viewport (<code className="code-chip">90dvh</code>); and <code className="code-chip">touch-action: manipulation</code> with no tap highlight on interactive elements. Text sizes, colours and spacing tokens do not change.
      </p>
    </div>
  );
}

const meta = {
  title: 'Foundations/Themes and Device',
  parameters: {
    ...docsParameters({
      purpose: 'How the one set of components adapts to the light and dark themes and to the Web and Tablet devices, using the toolbar Theme and Device globals.',
      source: 'src/styles/tokens.css (:root.dark, [data-device=\'tablet\']), src/lib/deviceType.ts',
      devices: ['Web: pointer device, default tokens. Tablet: a touch device (or `?device=tablet` / the toolbar Device switch); `data-device="tablet"` is set on <html> and control heights grow.', 'Changing Device reloads the preview, because the app reads the device once per page.'],
    }),
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const LightAndDark: Story = { render: () => <Section title="Light and dark"><ThemeDiff /></Section> };
export const Web: Story = { render: () => <Section title="Web"><Controls /></Section> };
export const Tablet: Story = { render: () => <Section title="Tablet (toolbar Device = Tablet)"><Controls /></Section>, tags: ['tablet'], globals: { device: 'tablet' } };
export const WebAndTabletSideBySide: Story = { render: () => <Section title="Web and Tablet"><WebVsTablet /></Section> };
export const TabletChanges: Story = { render: () => <Section title="What changes on a tablet"><WhatChanges /></Section> };
