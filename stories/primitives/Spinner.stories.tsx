import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Spinner } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Row, Specimen } from '../_shared/layout';

const meta = {
  title: 'Feedback & Status/Spinner',
  component: Spinner,
  parameters: {
    ...docsParameters({
      purpose: 'The app\'s busy indicator: a conic-gradient ring for a card, button or line of text that is waiting. The label is announced to assistive technology and not drawn - pair it with visible text where the wait needs explaining.',
      source: 'src/components/primitives/Spinner.tsx',
      variants: ['`size` in pixels: 20 (default, suits a line of body text), 32 (a card\'s empty state), any number.'],
      states: ['Spinning', 'Reduced motion: the ring is drawn complete and static, so the visible text is the only thing saying "waiting".'],
      usage: ['Used inside ValidationStatus (pending, retry). Not for a determinate progress - there is no progress value.', 'Loading text patterns in the app ("Loading X…" in EntityMissing) are plain text, not a Spinner.'],
      accessibility: ['`role="status"` with `aria-label` set to the required `label` (polite announcement when the wait starts, without stealing focus).'],
    }),
  },
  argTypes: {
    size: { control: { type: 'number', min: 12, max: 96, step: 4 }, description: 'Pixel diameter.' },
    label: { control: 'text', description: 'What is being waited for; announced, not drawn.' },
    className: { control: false },
  },
  args: { size: 20, label: 'Scanning the document' },
} satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status', { name: 'Scanning the document' })).toBeVisible();
  },
};
export const Large: Story = { args: { size: 32 } };

export const Sizes: Story = {
  render: () => (
    <Row>
      {[16, 20, 32, 48].map((n) => (
        <Specimen key={n} label={`${n}px`}>
          <Spinner size={n} label={`Loading ${n}`} />
        </Specimen>
      ))}
    </Row>
  ),
};

export const WithVisibleText: Story = {
  render: () => (
    <div className="row gap-2">
      <Spinner label="Checking the MOI registry" />
      <span className="body-text">Checking the MOI registry…</span>
    </div>
  ),
};
