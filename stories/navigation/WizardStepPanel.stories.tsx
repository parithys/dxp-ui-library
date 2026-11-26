import type { Meta, StoryObj } from '@storybook/react-vite';
import { WizardStepPanel } from '../../src/components/primitives/WizardStepPanel';
import { docsParameters } from '../_shared/docs';
import { Specimen } from '../_shared/layout';

const meta = {
  title: 'Navigation/Wizard Step Panel',
  component: WizardStepPanel,
  parameters: {
    ...docsParameters({
      purpose: 'The page body every guided step sits in: the step card (32px from the page edges, 24px padding) in the left column, anything that belongs under the card beneath it, and a summary column to its right. `bottomClass` leaves room for a fixed action bar.',
      source: 'src/components/primitives/WizardStepPanel.tsx (card: src/components/ui/card.tsx)',
      variants: ['Card only.', 'With `above` / `below` content in the card\'s column.', 'With an `aside` column (a running summary).'],
      events: ['`onKeyDown` - keyboard handling for the card (step shortcuts).'],
      usage: ['Every guided flow lays its steps out with this, so the card, its margins and the room for the action bar never differ between them.'],
    }),
  },
  argTypes: {
    panelRef: { control: false },
    onKeyDown: { control: false },
    cardClassName: { control: 'text', description: 'Extra classes for the step card.' },
    bottomClass: { control: 'text', description: 'Bottom padding that leaves room for the fixed action bar (default pb-24).' },
    above: { control: false },
    below: { control: false },
    aside: { control: false },
  },
  args: { children: <p className="body-text">The step&apos;s own content sits here.</p> },
} satisfies Meta<typeof WizardStepPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAsideAndBelow: Story = {
  args: {
    below: <p className="caption-muted px-8">Content under the card, in the same column.</p>,
    aside: (
      <Specimen label="Summary column">
        <p className="body-text">A running summary.</p>
      </Specimen>
    ),
  },
};
