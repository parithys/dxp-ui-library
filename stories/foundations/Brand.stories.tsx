import type { Meta, StoryObj } from '@storybook/react-vite';
import { VodafoneMark, VodafoneWordmark } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Section } from './tokenSource';

function Marks() {
  return (
    <div className="stack gap-6">
      <Section title="VodafoneMark" note="Square at any size; the fill is --brand-vodafone (a different red from --accent). Size it with className.">
        <div className="cluster gap-6">
          {['w-6 h-6', 'w-8 h-8', 'w-12 h-12', 'w-20 h-20'].map((c) => <div key={c} className="stack-center gap-2"><VodafoneMark className={c} /><code className="code-chip">{c}</code></div>)}
        </div>
      </Section>
      <Section title="VodafoneWordmark" note="Read by assistive technology as 'Vodafone'. Size it by height; width follows.">
        <div className="cluster gap-6">
          {['h-4 w-auto', 'h-5 w-auto', 'h-8 w-auto'].map((c) => <div key={c} className="stack-center gap-2"><VodafoneWordmark className={c} /><code className="code-chip">{c}</code></div>)}
        </div>
      </Section>
      <Section title="Mark and wordmark together" note="How the header and sign-in screen compose them (decorative mark, named wordmark).">
        <div className="row gap-2"><VodafoneMark className="w-8 h-8" /><VodafoneWordmark className="h-5 w-auto" /></div>
      </Section>
    </div>
  );
}

const meta = {
  title: 'Foundations/Brand',
  parameters: {
    ...docsParameters({
      purpose: 'The Vodafone mark and wordmark components. Use them; never inline the artwork.',
      source: 'src/components/primitives/VodafoneMark.tsx, VodafoneWordmark.tsx',
      accessibility: ['VodafoneMark is `aria-hidden`; VodafoneWordmark is `role="img"` named "Vodafone". Use the wordmark (or visible text) where the brand name must be announced.'],
    }),
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const MarkAndWordmark: Story = { render: () => <Marks /> };
