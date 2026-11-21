import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { docsParameters } from '../_shared/docs';
import { Section, TOKENS, readToken, useTheme } from './tokenSource';

/** The app's text roles (ui-components.css), each shown with its real class. */
const ROLES: { cls: string; label: string; note: string; as?: 'p' | 'span' | 'a' }[] = [
  { cls: 'title title-2xl', label: '.title .title-2xl', note: 'Page-level heading (--fs-h3).' },
  { cls: 'title title-xl', label: '.title .title-xl', note: 'Section heading (--fs-h4).' },
  { cls: 'title title-lg', label: '.title .title-lg', note: 'Card / panel heading (--fs-h5).' },
  { cls: 'title title-md', label: '.title .title-md', note: 'Sub-heading (--fs-body-lg).' },
  { cls: 'title title-sm', label: '.title .title-sm', note: 'Small heading (--fs-body).' },
  { cls: 'title title-xs', label: '.title .title-xs', note: 'Smallest heading (--fs-caption).' },
  { cls: 'body-text', label: '.body-text', note: 'Running text (--fs-body, --fg).' },
  { cls: 'value-text', label: '.value-text', note: 'A value beside its label: medium weight.' },
  { cls: 'value-text-lg', label: '.value-text-lg', note: 'A medium-weight value line that wraps.' },
  { cls: 'caption-secondary', label: '.caption-secondary', note: 'Caption in the second foreground tone.' },
  { cls: 'caption-muted', label: '.caption-muted', note: 'Caption in the muted tone.' },
  { cls: 'caption-strong', label: '.caption-strong', note: 'Emphasised caption.' },
  { cls: 'caption-note', label: '.caption-note', note: 'Explanatory note.' },
  { cls: 'caption-heading', label: '.caption-heading', note: 'Uppercase caption heading.' },
  { cls: 'eyebrow', label: '.eyebrow', note: 'Uppercase label above a heading.' },
  { cls: 'link', label: '.link', note: 'Text link (underline on hover); add .focus-ring for a keyboard ring.', as: 'a' },
  { cls: 'link-action', label: '.link-action', note: 'Inline text-link button.' },
];

function Measured({ cls, as }: { cls: string; as?: 'p' | 'span' | 'a' }) {
  const ref = useRef<HTMLElement>(null);
  const theme = useTheme();
  const [facts, setFacts] = useState('');
  useEffect(() => {
    if (!ref.current) return;
    const cs = getComputedStyle(ref.current);
    setFacts(`${cs.fontSize} / ${cs.fontWeight} / ${cs.lineHeight}`);
  }, [theme]);
  const text = 'Activate a new postpaid line';
  return (
    <div className="stack gap-1">
      {as === 'a' ? (
        <a ref={ref as React.Ref<HTMLAnchorElement>} href="#typography" className={cls}>{text}</a>
      ) : cls === 'link-action' ? (
        <button ref={ref as React.Ref<HTMLButtonElement>} type="button" className={cls}>{text}</button>
      ) : (
        <p ref={ref as React.Ref<HTMLParagraphElement>} className={cls}>{text}</p>
      )}
      <span className="caption-muted">size / weight / line-height: {facts}</span>
    </div>
  );
}

function TextRoles() {
  return (
    <div className="stack gap-4">
      {ROLES.map((r) => (
        <div key={r.label} className="card pad-row split">
          <div className="stack gap-1">
            <code className="code-chip">{r.label}</code>
            <span className="caption-muted">{r.note}</span>
          </div>
          <Measured cls={r.cls} as={r.as} />
        </div>
      ))}
    </div>
  );
}

function TokenRows({ prefix, property }: { prefix: string; property: 'fontSize' | 'fontWeight' }) {
  useTheme();
  const tokens = TOKENS.filter((t) => t.name.startsWith(prefix));
  return (
    <div className="stack gap-2">
      {tokens.map((t) => (
        <div key={t.name} className="row-between row-rule gap-4 py-2">
          <span className="stack gap-0"><code className="code-chip">{t.name}</code><span className="caption-muted">{readToken(t.name)}</span></span>
          <span className="body-text" style={{ [property]: `var(${t.name})` }}>The quick brown fox jumps over the lazy dog</span>
        </div>
      ))}
    </div>
  );
}

function FontFamily() {
  const family = readToken('--font-body');
  return (
    <div className="stack gap-3">
      <p className="body-text">
        One family for the whole app: <code className="code-chip">--font-body</code> = <code className="code-chip">{family}</code>. Figtree is loaded as a variable font
        (weights 300 to 900) by the single <code className="code-chip">&lt;link&gt;</code> in <code className="code-chip">app/layout.tsx</code>; Arial is the fallback for the
        pre-load flash and when the font request fails. Weights come from the <code className="code-chip">--fw-*</code> tokens.
      </p>
      <p className="title title-xl">Aa Bb Cc 0123456789</p>
    </div>
  );
}

const meta = {
  title: 'Foundations/Typography',
  parameters: {
    ...docsParameters({
      purpose: 'The text roles (semantic classes), the font-size and weight scales and the font family. Pick a role class; do not set a size in a component.',
      source: 'src/styles/components.css (text roles), src/styles/tokens.css (--fs-*, --fw-*, --font-body)',
      usage: ['Headings: `.title` plus one size modifier (`.title-xs` to `.title-2xl`). Body copy: `.body-text`. Secondary text: `.caption-*`. Labels above headings: `.eyebrow`.', 'Sizes read the `--fs-*` tokens, so a change there reaches every role.'],
      devices: ['Text sizes are identical on Web and Tablet; only control heights change (see Themes and Device).'],
    }),
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const TextRolesStory: Story = { name: 'Text roles', render: () => <Section title="Text roles" note="Each row uses the real class; the measured size, weight and line-height are read from the rendered element."><TextRoles /></Section> };
export const FontSizeTokens: Story = { render: () => <Section title="Font sizes (--fs-*)"><TokenRows prefix="--fs-" property="fontSize" /></Section> };
export const FontWeightTokens: Story = { render: () => <Section title="Font weights (--fw-*)"><TokenRows prefix="--fw-" property="fontWeight" /></Section> };
export const Family: Story = { name: 'Font family', render: () => <Section title="Figtree"><FontFamily /></Section> };
