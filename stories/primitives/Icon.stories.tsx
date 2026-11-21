import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, CHECK, DOWNLOAD_ICON, SEARCH_ICON } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Row, Specimen } from '../_shared/layout';

const meta = {
  title: 'Primitives/Icon',
  component: Icon,
  parameters: {
    ...docsParameters({
      purpose: 'The inline stroke-icon primitive (24px viewBox, currentColor, 2px stroke). Takes SVG path data exported from `src/assets/icons`. The full icon catalogue is in Foundations; this page documents the component API.',
      source: 'src/components/primitives/Icon.tsx',
      variants: ['Icon size is set by `className` (default `w-5 h-5`; the app also uses `size-4`, `size-5`, `icon-xs`).'],
      accessibility: ['Icon sets no accessible name and is not `aria-hidden` by itself, so put it in a labelled control.'],
      restrictions: ['Never write path strings in a component; import them from `src/assets/icons`.'],
    }),
  },
  argTypes: {
    path: { control: 'text', description: 'SVG path data.' },
    className: { control: 'text', description: 'Size and colour classes.' },
    strokeWidth: { control: { type: 'number', min: 1, max: 3, step: 0.5 }, description: 'Stroke weight (default 2).' },
  },
  args: { path: DOWNLOAD_ICON, className: 'w-5 h-5' },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Sizes: Story = {
  render: () => (
    <Row>
      {['size-3.5', 'size-4', 'w-5 h-5', 'size-6', 'size-8'].map((c) => (
        <Specimen key={c} label={c}><Icon path={SEARCH_ICON} className={c} /></Specimen>
      ))}
    </Row>
  ),
};
export const StrokeWeights: Story = {
  render: () => (
    <Row>
      <Specimen label="1.5"><Icon path={CHECK} className="size-6" strokeWidth={1.5} /></Specimen>
      <Specimen label="2 (default)"><Icon path={CHECK} className="size-6" /></Specimen>
      <Specimen label="3 (SelectedTick)"><Icon path={CHECK} className="size-6" strokeWidth={3} /></Specimen>
    </Row>
  ),
};

