import { useState } from 'react';
import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Input, BaseInput, Label } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Column, Row, Specimen } from '../_shared/layout';

type InputArgs = ComponentProps<typeof Input>;

/** Holds the typed value, because the field's filled border follows its `value`. */
function Controlled({ initial = '', ...args }: InputArgs & { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <div style={{ maxWidth: 360 }}>
      <Input {...args} value={value} onChange={(e) => { setValue(e.target.value); args.onChange?.(e); }} />
    </div>
  );
}

const meta = {
  title: 'Forms/Input',
  component: Input,
  parameters: {
    ...docsParameters({
      purpose: 'The app\'s text field: a label, the shadcn control, helper or error text and optional addons locked inside the left or right edge. Every single-line text, number, email and password field uses it.',
      source: 'src/components/primitives/Input.tsx (composite), src/components/ui/input.tsx (the control it draws)',
      variants: [
        'Plain field (no addon): the shadcn Input carries the border.',
        'leadingAddon: content inside the left edge with a divider rule (the country flag and dial code on PhoneNumberInput).',
        'trailingAddon: content inside the right edge, no divider (a unit, a status tick, a small action; the date field\'s calendar button).',
        'Both addons compose.',
      ],
      states: ['Empty', 'Populated (darker border once it has a value)', 'Hover (border changes)', 'Focus (focus ring)', 'Disabled', 'Read-only (inert: out of the Tab order, no focus ring, no hover border, text stays full contrast)', 'Required (red asterisk, aria-required)', 'Error (red border and message)'],
      events: ['onChange / onBlur / onFocus: native input events (all other input props pass through).'],
      usage: [
        'Use for one line of free text. Use Textarea for several lines, Select for a fixed list, DateInput, PhoneNumberInput or QidInput for those value types.',
        'There is no placeholder: the prop is accepted so call sites need no change, but it is dropped. The label says what the field is.',
        'There is no Optional marker and no character counter. Mandatory is marked with `required`; an optional field is simply unmarked. Use the native `maxLength` to cap input.',
        'On a touch device a number field opens the numeric keypad (decimal when `step` allows fractions); any other field names the keypad with `inputMode`.',
      ],
      validation: ['The error text replaces the helper text, is rendered with role="alert" and sets aria-invalid on the input. The component only displays an error; the owner decides when it is raised (see Forms/Validation).'],
      accessibility: [
        'The label is a real <label htmlFor> bound to the input id (generated when none is given).',
        'The required asterisk is aria-hidden: the input carries aria-required, so a screen reader announces the state.',
        'aria-describedby points at the error text when there is an error, otherwise at the helper text, plus any aria-describedby the caller passes.',
        'A read-only field has tabIndex -1: it stays in the accessibility tree (role, name, value) but is skipped by Tab. A caller can pass its own tabIndex.',
        'Focus ring: teal in light, foreground colour in dark.',
      ],
      devices: ['The field height follows --field-height, which is --control-h-md: 2.625rem on Web and 3rem on Tablet (tablet.css). Switch the toolbar Device to compare.'],
    }),
  },
  argTypes: {
    label: { control: 'text', description: 'Visible label, bound to the input.' },
    helperText: { control: 'text', description: 'Muted text under the field; hidden while an error is shown.' },
    error: { control: 'text', description: 'Error message; sets aria-invalid, the red border and role="alert" text.' },
    required: { control: 'boolean', description: 'Red asterisk after the label and aria-required.' },
    disabled: { control: 'boolean', description: 'Unavailable: greyed label and field.' },
    readOnly: { control: 'boolean', description: 'Shown, not editable, not focusable.' },
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'tel'], description: 'Native input type.' },
    inputMode: { control: 'select', options: [undefined, 'text', 'numeric', 'decimal', 'tel', 'email'], description: 'Touch keypad hint.' },
    leadingAddon: { control: false, description: 'Node locked inside the left edge (with a divider).' },
    trailingAddon: { control: false, description: 'Node locked inside the right edge.' },
    onChange: { action: 'changed' },
  },
  args: { label: 'Full name', onChange: fn(), onBlur: fn() },
  render: (args) => <Controlled {...args} />,
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Full name');
    await expect(input).toHaveValue('');
    await expect(input).not.toHaveAttribute('aria-invalid');
  },
};

export const Populated: Story = {
  render: (args) => <Controlled {...args} initial="Aisha Al Thani" />,
};

export const Typing: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Full name');
    await userEvent.type(input, 'Omar Khalid');
    await expect(input).toHaveValue('Omar Khalid');
  },
};

export const Focus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByLabelText('Full name')).toHaveFocus();
  },
};

export const Hover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByLabelText('Full name'));
  },
};

export const WithHelperText: Story = { args: { helperText: 'As printed on the Qatar ID.' } };

export const Required: Story = {
  args: { required: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText('Full name', { exact: false })).toHaveAttribute('aria-required', 'true');
  },
};

export const Optional: Story = {
  args: { label: 'Nickname', helperText: 'Optional' },
  render: (args) => <Controlled {...args} />,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <Controlled {...args} initial="Aisha Al Thani" />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText('Full name')).toBeDisabled();
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true, helperText: 'Registry data - read back to the customer.' },
  render: (args) => <Controlled {...args} initial="Aisha Al Thani" />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Full name');
    await expect(input).toHaveAttribute('readonly');
    await expect(input).toHaveAttribute('tabindex', '-1');
    await userEvent.tab();
    await expect(input).not.toHaveFocus();
  },
};

export const ValidationError: Story = {
  args: { required: true, error: 'Enter the full name.' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByLabelText('Full name', { exact: false });
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input.getAttribute('aria-describedby')).toContain('-error');
    await expect(c.getByRole('alert')).toHaveTextContent('Enter the full name.');
  },
};

export const LeadingAddon: Story = {
  args: { label: 'Amount', leadingAddon: 'QAR', type: 'number' },
};

export const TrailingAddon: Story = {
  args: { label: 'Data allowance', trailingAddon: 'GB', type: 'number' },
};

export const BothAddons: Story = {
  args: { label: 'Credit limit', leadingAddon: 'QAR', trailingAddon: 'per month', type: 'number' },
};

export const InputTypes: Story = {
  render: () => (
    <Column>
      <Specimen label="type=email"><Controlled label="Email" type="email" /></Specimen>
      <Specimen label="type=password"><Controlled label="PIN" type="password" /></Specimen>
      <Specimen label="type=number (numeric keypad on touch)"><Controlled label="Quantity" type="number" step="1" /></Specimen>
      <Specimen label="type=number step=0.01 (decimal keypad on touch)"><Controlled label="Price" type="number" step="0.01" /></Specimen>
      <Specimen label="inputMode=numeric on a text field"><Controlled label="Account number" inputMode="numeric" /></Specimen>
    </Column>
  ),
};

export const AllStates: Story = {
  render: () => (
    <Row>
      <Specimen label="Empty"><Controlled label="Full name" /></Specimen>
      <Specimen label="Populated"><Controlled label="Full name" initial="Aisha Al Thani" /></Specimen>
      <Specimen label="Required"><Controlled label="Full name" required /></Specimen>
      <Specimen label="Disabled"><Controlled label="Full name" disabled initial="Aisha Al Thani" /></Specimen>
      <Specimen label="Read-only"><Controlled label="Full name" readOnly initial="Aisha Al Thani" /></Specimen>
      <Specimen label="Error"><Controlled label="Full name" error="Enter the full name." /></Specimen>
    </Row>
  ),
};

/** The shadcn control the composite draws, on its own: state follows aria-invalid, readOnly and a value. */
export const BaseControl: Story = {
  parameters: { docs: { description: { story: 'src/components/ui/input.tsx on its own. It carries no label, helper or addons: the border state comes from aria-invalid (error), readOnly, a value (filled) or default. Prefer the composite above.' } } },
  render: () => (
    <Row>
      <Specimen label="Default"><BaseInput aria-label="Default" defaultValue="" /></Specimen>
      <Specimen label="Filled"><BaseInput aria-label="Filled" value="Filled" readOnly={false} onChange={fn()} /></Specimen>
      <Specimen label="Error"><BaseInput aria-label="Error" aria-invalid="true" /></Specimen>
      <Specimen label="Read-only"><BaseInput aria-label="Read-only" readOnly value="Read-only" /></Specimen>
      <Specimen label="Disabled"><BaseInput aria-label="Disabled" disabled /></Specimen>
      <Specimen label="With a Label"><div className="stack gap-1"><Label htmlFor="base-lbl">Label</Label><BaseInput id="base-lbl" /></div></Specimen>
    </Row>
  ),
};
