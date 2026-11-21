import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { docsParameters } from '../_shared/docs';
import { FilterBox, TOKENS, isColour, isSelfContained, readToken, useTheme } from './tokenSource';
import type { TokenDecl } from './tokenSource';

interface Group {
  id: string;
  title: string;
  note: string;
  test: RegExp;
}

// First match wins, so the narrower families come first. Membership is decided by the token NAME only; whether a token is a colour is asked of
// the browser at runtime (CSS.supports), so a token that stops being a colour drops out of these tables by itself.
const GROUPS: Group[] = [
  { id: 'navigation', title: 'Navigation rail', note: 'The side navigation and its states.', test: /^--nav-/ },
  { id: 'on-dark', title: 'On dark surfaces', note: 'Text, fills and lines for dark panels (hero, login, toasts), plus scrims and the tooltip inverse surface.', test: /^--(on-dark|login-|dash-hero|white-glass|scrim|tooltip|black-)/ },
  { id: 'status', title: 'Status: success, danger, warning, info', note: 'Text/border colours (--success, --danger), solid fills that carry a white label (-solid), banner fills and toast dots.', test: /^--(success|danger|warn|info|toast-|badge-success|approval)/ },
  { id: 'accent', title: 'Accent and brand', note: 'The Vodafone red accent and its states, links and brand marks.', test: /^--(accent|brand|link|highlight|signal|priority)/ },
  { id: 'tones', title: 'Tones and tints', note: 'Soft fills for banners, pills, tags, icon tiles and Recommended Offers cards.', test: /^--(tone-|tint-|tag-|segment-|offer-|icon-tile|customer-view|summary-milestone|telesales)/ },
  { id: 'fields', title: 'Borders and field chrome', note: 'Dividers, card borders, and every form-field state (hover, focus, error, disabled, selected).', test: /^--(border|field-|color-field|focus-outline|table-border|selected-row|tab-line|grey-form)/ },
  { id: 'text', title: 'Text', note: 'Foreground tones.', test: /^--(fg|muted|signature)/ },
  { id: 'surfaces', title: 'Surfaces and backgrounds', note: 'Page, card and panel fills.', test: /^--(bg|page-bg|surface|paper|charcoal|title-band|header-glass|table-header|light-neutral|grey-|btn-secondary|signature-paper)/ },
];
const OTHER: Group = { id: 'other', title: 'Other colours', note: 'Colour tokens not in a family above.', test: /./ };

const groupOf = (name: string): Group => GROUPS.find((g) => g.test.test(name)) ?? OTHER;

function Swatch({ cssValue, label }: { cssValue: string; label: string }) {
  return <span role="img" aria-label={label} className="card block h-8 w-16 shrink-0" style={{ background: cssValue }} />;
}

function ColourRow({ token, query }: { token: TokenDecl; query: string }) {
  const live = readToken(token.name);
  const q = query.toLowerCase();
  if (q && !token.name.includes(q) && !live.toLowerCase().includes(q)) return null;
  return (
    <tr className="row-rule">
      <td className="pad-row"><Swatch cssValue={`var(${token.name})`} label={`${token.name} now`} /></td>
      <td className="pad-row"><code className="code-chip">{token.name}</code></td>
      <td className="pad-row caption-secondary">{live}</td>
      <td className="pad-row">
        {isSelfContained(token.light) ? <span className="row gap-2"><Swatch cssValue={token.light} label={`${token.name} light`} /><span className="caption-muted">{token.light}</span></span> : <span className="caption-muted">{token.light ?? '-'}</span>}
      </td>
      <td className="pad-row">
        {token.dark === undefined ? <span className="caption-muted">same as light</span> : isSelfContained(token.dark) ? <span className="row gap-2"><Swatch cssValue={token.dark} label={`${token.name} dark`} /><span className="caption-muted">{token.dark}</span></span> : <span className="caption-muted">{token.dark}</span>}
      </td>
    </tr>
  );
}

function ColourTable({ group, query }: { group: Group; query: string }) {
  useTheme(); // re-read the live values when the toolbar flips the theme
  const tokens = useMemo(() => TOKENS.filter((t) => groupOf(t.name).id === group.id), [group.id]);
  const colours = tokens.filter((t) => isColour(readToken(t.name)));
  return (
    <section className="stack gap-3">
      <h3 className="title title-md">{group.title} <span className="caption-muted">({colours.length})</span></h3>
      <p className="caption-muted">{group.note}</p>
      <div className="card overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="row-rule caption-heading">
              <th className="pad-row">Now</th><th className="pad-row">Token</th><th className="pad-row">Resolved now (toolbar theme)</th><th className="pad-row">Declared light</th><th className="pad-row">Declared dark</th>
            </tr>
          </thead>
          <tbody>{colours.map((t) => <ColourRow key={t.name} token={t} query={query} />)}</tbody>
        </table>
      </div>
    </section>
  );
}

function Palette({ groups }: { groups: Group[] }) {
  const [query, setQuery] = useState('');
  const theme = useTheme();
  return (
    <div className="stack gap-6">
      <p className="body-text">
        Read live from <code className="code-chip">src/styles/tokens.css</code>. The <strong>Now</strong> swatch paints <code className="code-chip">var(--token)</code> itself, so it
        follows the toolbar <strong>Theme</strong> (now: {theme}). The dark theme is the <code className="code-chip">:root.dark</code> block of the same file, applied to the whole page
        by the toolbar - it cannot be scoped to one container - so light and dark are compared in the two <em>Declared</em> columns (a swatch is drawn only when the declared
        value is self-contained, i.e. holds no <code className="code-chip">var()</code> reference).
      </p>
      <FilterBox value={query} onChange={setQuery} label="Filter by token name or value" />
      {groups.map((g) => <ColourTable key={g.id} group={g} query={query} />)}
    </div>
  );
}

const meta = {
  title: 'Foundations/Colors',
  parameters: {
    ...docsParameters({
      purpose: 'Every colour design token, read from the stylesheet at runtime, grouped by role. Use the token (a Tailwind alias such as text-fg / bg-surface, or var(--token)) - never a literal colour.',
      source: 'src/styles/tokens.css (:root and :root.dark)',
      usage: ['Colour is only ever applied through a token; tests (ui.test.mjs, tokens.test.mjs) reject literal colours in .ts/.tsx and undefined or dead tokens.', 'Tokens that are not colours (sizes, radii, shadows) are on the Spacing, Radius and Typography pages.'],
      devices: ['Switch Theme in the toolbar to see the dark values; tokens.css redefines the structural colours under `:root.dark`.'],
    }),
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const AllColours: Story = { render: () => <Palette groups={[...GROUPS, OTHER]} /> };
export const Accent: Story = { render: () => <Palette groups={GROUPS.filter((g) => g.id === 'accent')} /> };
export const Surfaces: Story = { render: () => <Palette groups={GROUPS.filter((g) => g.id === 'surfaces')} /> };
export const Text: Story = { render: () => <Palette groups={GROUPS.filter((g) => g.id === 'text')} /> };
export const BordersAndFields: Story = { render: () => <Palette groups={GROUPS.filter((g) => g.id === 'fields')} /> };
export const Status: Story = { render: () => <Palette groups={GROUPS.filter((g) => g.id === 'status')} /> };
export const TonesAndTints: Story = { render: () => <Palette groups={GROUPS.filter((g) => g.id === 'tones')} /> };
export const Navigation: Story = { render: () => <Palette groups={GROUPS.filter((g) => g.id === 'navigation')} /> };
export const OnDark: Story = { render: () => <Palette groups={GROUPS.filter((g) => g.id === 'on-dark')} /> };
