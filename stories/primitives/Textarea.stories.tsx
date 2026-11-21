import { useState } from 'react';
import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Textarea, BaseTextarea } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Row, Specimen } from '../_shared/layout';

type TextareaArgs = ComponentProps<typeof Textarea>;

function Controlled({ initial = '', ...args }: TextareaArgs & { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <div style={{ maxWidth: 420 }}>
      <Textarea {...args} value={value} onChange={(e) => { setValue(e.target.value); args.onChange?.(e); }} />
    </div>
  );
}

const meta = {
  title: 'Forms/Textarea',
  component: Textarea,
  parameters: {
    ...docsParameters({
      purpose: 'The app\'s multi-line field: a label, the shadcn textarea (4 rows by default), helper or error text.',
      source: 'src/components/primitives/Textarea.tsx (composite), src/components/ui/textarea.tsx (the control it draws)',
      states: ['Empty', 'Populated', 'Focus', 'Disabled', 'Required', 'Error'],
      events: ['onChange / onBlur: native textarea events (every other textarea prop passes through, so `rows` and `maxLength` work).'],
      usage: [
        'No placeholder (dropped by the component) and no built-in character counter; cap with the native `maxLength`.',
        'There is no read-only look: unlike Input, a readOnly textarea gets no special styling.',
      ],
      validation: ['Error text replaces the helper text, has role="alert" and the textarea gets aria-invalid.'],
      accessibility: ['Label bound with htmlFor; aria-required with an aria-hidden asterisk; aria-describedby points at the error or the helper text.'],
      devices: ['Same --control-h tokens as Input for padding and type size; the height is set by `rows`.'],
    }),
  },
  argTypes: {
    label: { control: 'text', description: 'Visible label.' },
    helperText: { control: 'text', description: 'Muted text under the field; hidden while an error shows.' },
    error: { control: 'text', description: 'Error message (aria-invalid, red border, role="alert").' },
    required: { control: 'boolean', description: 'Asterisk and aria-required.' },
    disabled: { control: 'boolean', description: 'Unavailable.' },
    rows: { control: { type: 'number', min: 2, max: 12 }, description: 'Visible rows (default 4).' },
    maxLength: { control: 'number', description: 'Native character cap.' },
    onChange: { action: 'changed' },
  },
  args: { label: 'Notes', onChange: fn() },
  render: (args) => <Controlled {...args} />,
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Populated: Story = { render: (args) => <Controlled {...args} initial={'Customer asked for a callback after 4 pm.\nPrefers Arabic.'} /> };
export const WithHelperText: Story = { args: { helperText: 'Visible to back-office agents.' } };
export const Required: Story = { args: { required: true } };
export const Optional: Story = { args: { label: 'Additional comments', helperText: 'Optional' } };
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <Controlled {...args} initial="Locked while the order is submitted." />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText('Notes')).toBeDisabled();
  },
};

export const Typing: Story = {
  play: async ({ canvasElement }) => {
    const area = within(canvasElement).getByLabelText('Notes');
    await userEvent.type(area, 'Line one{enter}Line two');
    await expect(area).toHaveValue('Line one\nLine two');
  },
};

export const Focus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByLabelText('Notes')).toHaveFocus();
  },
};

export const ValidationError: Story = {
  args: { required: true, error: 'Notes are required.' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const area = c.getByLabelText('Notes', { exact: false });
    await expect(area).toHaveAttribute('aria-invalid', 'true');
    await expect(area.getAttribute('aria-describedby')).toContain('-error');
    await expect(c.getByRole('alert')).toBeVisible();
  },
};

export const LimitedLength: Story = {
  args: { maxLength: 40, helperText: 'Up to 40 characters (native maxLength; there is no counter).' },
  play: async ({ canvasElement }) => {
    const area = within(canvasElement).getByLabelText('Notes');
    await userEvent.type(area, 'x'.repeat(60));
    await expect((area as HTMLTextAreaElement).value.length).toBe(40);
  },
};

export const AllStates: Story = {
  render: () => (
    <Row>
      <Specimen label="Empty"><Controlled label="Notes" /></Specimen>
      <Specimen label="Populated"><Controlled label="Notes" initial="Callback after 4 pm." /></Specimen>
      <Specimen label="Required"><Controlled label="Notes" required /></Specimen>
      <Specimen label="Disabled"><Controlled label="Notes" disabled initial="Locked." /></Specimen>
      <Specimen label="Error"><Controlled label="Notes" error="Notes are required." /></Specimen>
    </Row>
  ),
};

export const BaseControl: Story = {
  parameters: { docs: { description: { story: 'src/components/ui/textarea.tsx on its own: border state follows aria-invalid, a value or default.' } } },
  render: () => (
    <Row>
      <Specimen label="Default"><BaseTextarea aria-label="Default" /></Specimen>
      <Specimen label="Filled"><BaseTextarea aria-label="Filled" value="Filled" onChange={fn()} /></Specimen>
      <Specimen label="Error"><BaseTextarea aria-label="Error" aria-invalid="true" /></Specimen>
    </Row>
  ),
};
