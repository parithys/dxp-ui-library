import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Label } from '../../src';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Primitives/Label',
  component: Label,
  parameters: {
    ...docsParameters({
      purpose: 'A `<label>` with Radix behaviour (no text selection on double click, association by `htmlFor` or by wrapping) and no look of its own. Pass the semantic class `field-label` for the standard field-label look.',
      source: 'src/components/ui/label.tsx',
      states: ['Plain, or `field-label` styled. Disabled styling belongs to the associated control.'],
      usage: ['Prefer the field composites (Forms/Input) which already label their control. Use Label directly for custom controls.'],
      accessibility: ['Clicking the label focuses or toggles the associated control; `htmlFor` must match the control id.'],
    }),
  },
  argTypes: {
    htmlFor: { control: 'text', description: 'Id of the associated control.' },
    className: { control: 'text', description: 'Use `field-label` for the app look.' },
    children: { control: 'text', description: 'Label text.' },
  },
  args: { htmlFor: 'demo-input', className: 'field-label', children: 'Mobile number' },
} satisfies Meta<typeof Label>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="stack gap-2" style={{ maxWidth: 320 }}>
      <Label {...args} />
      <input id="demo-input" className="form-control" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByText('Mobile number'));
    await expect(within(canvasElement).getByRole('textbox')).toHaveFocus();
  },
};
export const Unstyled: Story = { args: { className: '', children: 'No look of its own' } };
