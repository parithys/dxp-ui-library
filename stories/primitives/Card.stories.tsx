import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Button, SelectedCardTexture, SelectedTick, CARD_HIGHLIGHT, CARD_IDLE, CARD_SELECTED } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Column, Row, Specimen } from '../_shared/layout';

const meta = {
  title: 'Primitives/Card',
  component: Card,
  parameters: {
    ...docsParameters({
      purpose: 'The app\'s card surface: the `.card` class (16px radius, card border, page fill, no shadow) and nothing else. The call site chooses padding and layout. Header / Title / Description / Content / Footer / Action are optional parts for new compositions.',
      source: 'src/components/ui/card.tsx, src/components/primitives/cardParts.tsx',
      variants: ['Modifier classes from ui-components.css: `card-lg` (larger radius), `card-surface` (surface fill), `card-interactive` (hover fill, for a card that is a link or button).', 'Selectable-card states: `card-idle`, `card-selected`, `card-highlight` (see Primitives/Selectable Card).'],
      states: ['Idle, hover (fill only, never a border), selected, highlighted.'],
      usage: ['Wrap grouped content. A clickable card should be a `<button>` or link carrying `card` classes, with `card-interactive`.'],
      accessibility: ['Card is a plain div with no role; give interactive cards a real button or link.'],
    }),
  },
  argTypes: {
    className: { control: 'text', description: 'Padding, layout and the modifier classes above.' },
    children: { control: false },
  },
  args: { className: 'p-6' },
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <p className="body-text">A plain card: border, radius and page fill.</p>
    </Card>
  ),
};

export const WithParts: Story = {
  render: (args) => (
    <Card {...args} className="py-4" style={{ maxWidth: 480 }}>
      <CardHeader>
        <CardTitle>Plan summary</CardTitle>
        <CardDescription>Monthly plan and add-ons</CardDescription>
        <CardAction><Button variant="tertiary">Edit</Button></CardAction>
      </CardHeader>
      <CardContent><p className="body-text">Postpaid 145, 100 GB data</p></CardContent>
      <CardFooter className="gap-3"><Button variant="secondary">Back</Button><Button>Continue</Button></CardFooter>
    </Card>
  ),
};

export const Large: Story = { args: { className: 'p-6 card-lg' }, render: (args) => <Card {...args}><p className="body-text">card-lg</p></Card> };
export const SurfaceFill: Story = { args: { className: 'p-6 card-surface' }, render: (args) => <Card {...args}><p className="body-text">card-surface</p></Card> };

export const Interactive: Story = {
  parameters: { docs: { description: { story: 'A real button carrying `card card-interactive`: hover changes the background only.' } } },
  render: () => {
    const [clicks, setClicks] = useState(0);
    return (
      <Card className="card-interactive p-4" style={{ maxWidth: 320 }}>
        <button type="button" className="card-block" onClick={() => setClicks((c) => c + 1)}>
          Open customer ({clicks})
        </button>
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const b = within(canvasElement).getByRole('button');
    await userEvent.hover(b);
    await userEvent.click(b);
    await expect(b).toHaveTextContent('(1)');
  },
};

export const SelectableStates: Story = {
  name: 'Idle, selected, highlighted',
  render: () => (
    <Row>
      <Card className={`card-option p-4 ${CARD_IDLE}`} style={{ width: 200 }}>Idle</Card>
      <Card className={`card-option relative isolate p-4 ${CARD_SELECTED}`} style={{ width: 200 }}>
        <SelectedCardTexture />
        <SelectedTick />
        Selected
      </Card>
      <Card className={`card-option p-4 ${CARD_HIGHLIGHT}`} style={{ width: 200 }}>Highlighted</Card>
    </Row>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <Column>
      <Specimen label="card"><Card className="p-4">Default</Card></Specimen>
      <Specimen label="card-lg"><Card className="p-4 card-lg">Large radius</Card></Specimen>
      <Specimen label="card-surface"><Card className="p-4 card-surface">Surface fill</Card></Specimen>
    </Column>
  ),
};
