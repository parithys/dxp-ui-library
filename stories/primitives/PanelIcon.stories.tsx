import type { Meta, StoryObj } from '@storybook/react-vite';
import { PanelIcon } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Row, Specimen } from '../_shared/layout';

const meta = {
  title: 'Primitives/Panel Icon',
  component: PanelIcon,
  parameters: {
    ...docsParameters({
      purpose: 'The sidebar-panel icon: a rounded window with the left (navigation) pane shaded and a chevron in the main pane that points away from the navigation to collapse it and towards it to expand it.',
      source: 'src/components/primitives/PanelIcon.tsx',
      variants: ['`expanded` true: chevron points left (collapse). `expanded` false: chevron points right (expand).'],
      states: ['Static; the caller swaps `expanded` as the panel toggles.'],
      usage: ['Put it inside the toggle button; size and colour come from `className` (currentColor).'],
      accessibility: ['`aria-hidden`; the button around it needs its own accessible name.'],
    }),
  },
  argTypes: {
    expanded: { control: 'boolean', description: 'Whether the panel is currently open (flips the chevron).' },
    className: { control: 'text', description: 'Size and colour classes.' },
  },
  args: { expanded: true, className: 'size-6' },
} satisfies Meta<typeof PanelIcon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Collapsed: Story = { args: { expanded: false } };

export const BothStates: Story = {
  render: () => (
    <Row>
      <Specimen label="expanded"><PanelIcon expanded className="size-6" /></Specimen>
      <Specimen label="collapsed"><PanelIcon expanded={false} className="size-6" /></Specimen>
    </Row>
  ),
};
