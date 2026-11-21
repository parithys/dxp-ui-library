import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardContent } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Section, TOKENS, readToken, useTheme } from './tokenSource';

const names = (test: RegExp) => TOKENS.filter((t) => test.test(t.name)).map((t) => t.name);

function Label({ name }: { name: string }) {
  useTheme();
  return <span className="stack gap-0"><code className="code-chip">{name}</code><span className="caption-muted">{readToken(name)}</span></span>;
}

function Radii() {
  return (
    <div className="grid-2-up gap-6">
      {names(/^--radius-/).map((n) => (
        <Card key={n} className="pad-panel stack gap-2" style={{ borderRadius: `var(${n})` }}>
          <Label name={n} />
        </Card>
      ))}
    </div>
  );
}

function BorderCards() {
  const list = names(/^--(border|field-border|field-card-border|table-border|tab-line-color)/).filter((n) => !n.endsWith('-w'));
  return (
    <div className="grid-2-up gap-6">
      {list.map((n) => (
        <Card key={n} className="pad-panel stack gap-2" style={{ borderColor: `var(${n})` }}>
          <Label name={n} />
        </Card>
      ))}
    </div>
  );
}

function ElevationCards() {
  const list = names(/^--(elev-|shadow-|focus-ring|field-focus-ring)/);
  return (
    <div className="grid-2-up gap-6">
      {list.map((n) => (
        <Card key={n} className="pad-panel" style={{ boxShadow: `var(${n})` }}>
          <CardContent className="stack gap-2 px-0"><Label name={n} /></CardContent>
        </Card>
      ))}
    </div>
  );
}

const meta = {
  title: 'Foundations/Radius, Borders and Shadows',
  component: Card,
  parameters: {
    ...docsParameters({
      purpose: 'Corner radii, border colours and elevation tokens, each shown on the real Card. Components read these tokens (rounded-[var(--radius-card)], border-[var(--field-card-border)], shadow-[var(--elev-raised)]); no literal radius or shadow is allowed.',
      source: 'src/styles/tokens.css (--radius-*, --border*, --field-*border*, --elev-*, --shadow-*, --focus-ring), src/components/ui/card.tsx',
      usage: ['Card hover changes the background only (`--field-card-hover-bg`), never a border or ring.', 'Filled cards carry no shadow by default; elevation tokens are for floating surfaces (popovers, dashboard tiles, login card).', 'Dark mode overrides the elevation tokens in `:root.dark`; switch Theme to compare.'],
    }),
  },
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Radius: Story = { render: () => <Section title="Radius tokens"><Radii /></Section> };
export const Borders: Story = { render: () => <Section title="Border and field-border tokens" note="The card's 1px border recoloured with each token."><BorderCards /></Section> };
export const Elevation: Story = { render: () => <Section title="Elevation and ring tokens" note="Includes the focus ring tokens, which are box-shadows."><ElevationCards /></Section> };
