import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CountryMarker } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Column, Row, Specimen } from '../_shared/layout';

const meta = {
  title: 'Primitives/Country Marker',
  component: CountryMarker,
  parameters: {
    ...docsParameters({
      purpose: 'The 16px circular marker shown beside a dial code. A flag is drawn only where it can be drawn correctly (Qatar); every other ISO code is a lettered chip.',
      source: 'src/components/primitives/CountryMarker.tsx',
      variants: ['`QA`: drawn Qatar flag (SVG).', 'Any other `iso`: lettered chip (`marker-chip`) showing the code.'],
      states: ['Static; decorative.'],
      usage: ['Place it inside a labelled control (the country picker); it names nothing itself.'],
      accessibility: ['Both forms are `aria-hidden`; the control around the marker carries the accessible name.'],
    }),
  },
  argTypes: {
    iso: { control: 'text', description: 'ISO country code. `QA` draws the flag; others show a chip.' },
    className: { control: false },
  },
  args: { iso: 'QA' },
} satisfies Meta<typeof CountryMarker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LetteredChip: Story = {
  args: { iso: 'IN' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('IN', { ignore: '[aria-hidden="false"]' })).toBeInTheDocument();
  },
};

export const AllMarkers: Story = {
  render: () => (
    <Column>
      <Row>
        {['QA', 'IN', 'SA', 'AE', 'OM', 'PK'].map((iso) => (
          <Specimen key={iso} label={iso}><CountryMarker iso={iso} /></Specimen>
        ))}
      </Row>
    </Column>
  ),
};
