import { useState } from 'react';
import type { ChangeEvent, ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { PhoneNumberInput } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Row, Specimen } from '../_shared/layout';

type PhoneArgs = ComponentProps<typeof PhoneNumberInput>;

function Controlled({ initial = '', ...args }: Omit<PhoneArgs, 'value' | 'onChange'> & { initial?: string; onChange?: PhoneArgs['onChange'] }) {
  const [value, setValue] = useState(initial);
  return (
    <div style={{ maxWidth: 380, minHeight: 360 }}>
      <PhoneNumberInput {...args} value={value} onChange={(e: ChangeEvent<HTMLInputElement>) => { setValue(e.target.value); args.onChange?.(e); }} />
      <p className="caption-muted mt-2">Stored (E.164): <code>{value || '(empty)'}</code></p>
    </div>
  );
}

const meta = {
  title: 'Forms/Phone Number Input',
  component: PhoneNumberInput,
  parameters: {
    ...docsParameters({
      purpose: 'The shared phone field: a country calling-code dropdown locked inside the left edge, then the national digits. The stored value is always E.164 (dial code + national digits). PROTECTED - a plain Input has none of this.',
      source: 'src/components/primitives/PhoneNumberInput.tsx',
      variants: ['International (default): country picker, Qatar +974 preselected', '`fixedIso`: dial code pinned and the picker hidden, for a field whose rule names one country', '`maskedDisplay`: shows masked text instead of the digits; focus selects it, typing replaces it', '`maxNationalDigits`: hard cap on national digits (a Qatar number is 8)'],
      states: ['Empty', 'Populated', 'Country list open', 'Focus', 'Read-only', 'Required', 'Error'],
      events: ['onChange(e): `e.target.value` is the E.164 string, or "" when no digits (never a bare dial code). Picking a country rewrites the prefix and keeps the digits.'],
      usage: [
        'Non-digits are dropped as typed; the national length is capped at 15 minus the dial code (and by maxNationalDigits).',
        'The selected country is component state (dial codes are not unique); it is seeded from the value on mount and when a value arrives later, until the user picks a country.',
        'No placeholder (dropped) and no `disabled` prop. noAutoFocus keeps the wizard\'s arrival auto-focus off an optional field. The country list is not searchable; typing a letter jumps to the next country starting with it.',
        'Validation of the number (length, mobile prefix) is the owner\'s job.',
      ],
      validation: ['`error` text replaces the helper (role="alert") and the field gets aria-invalid.'],
      accessibility: [
        'The country trigger is a button role="combobox" named "Country calling code, currently Qatar +974", with aria-expanded / aria-controls / aria-activedescendant; the list is role="listbox".',
        'Keyboard on the trigger: ArrowDown / ArrowUp / Enter / Space open; Arrow keys, Home, End, PageUp / PageDown move; Enter or Space chooses; Escape closes the list only; Tab closes; letters type-ahead by country name.',
        'The digits input has inputMode="tel", autocomplete="tel-national", a label, aria-required and aria-describedby as Input does.',
        'A pinned country (`fixedIso`) is a plain, non-focusable label - not a disabled button.',
      ],
      devices: ['Same field height as Input: --control-h-md (2.625rem Web, 3rem Tablet).'],
    }),
  },
  argTypes: {
    label: { control: 'text', description: 'Visible label.' },
    helperText: { control: 'text', description: 'Muted text under the field.' },
    error: { control: 'text', description: 'Error message.' },
    required: { control: 'boolean', description: 'Asterisk and aria-required.' },
    readOnly: { control: 'boolean', description: 'Shown, not editable.' },
    fixedIso: { control: 'select', options: [undefined, 'QA', 'IN', 'GB'], description: 'Pin the country (ISO code) and hide the picker.' },
    maxNationalDigits: { control: { type: 'number', min: 1, max: 15 }, description: 'Cap on national digits.' },
    maskedDisplay: { control: 'text', description: 'Masked text shown instead of the digits.' },
    noAutoFocus: { control: 'boolean', description: 'Keeps wizard auto-focus off this field.' },
    value: { control: false },
    onChange: { action: 'changed' },
  },
  args: { label: 'Mobile number', value: '', onChange: fn() },
  render: (args) => <Controlled {...args} />,
} satisfies Meta<typeof PhoneNumberInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Populated: Story = { render: (args) => <Controlled {...args} initial="+97455512345" /> };

export const TypingDigitsOnly: Story = {
  args: { fixedIso: 'QA', maxNationalDigits: 8 },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByLabelText('Mobile number');
    await userEvent.type(field, '5a5-5 512 3456789');
    await expect(field).toHaveValue('55551234');
    await expect(within(canvasElement).getByText('+97455551234')).toBeVisible();
  },
};

export const PickCountry: Story = {
  render: (args) => <Controlled {...args} initial="+97455512345" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('combobox', { name: /Country calling code/ }));
    await expect(c.getByRole('listbox', { name: 'Country calling code' })).toBeVisible();
    await userEvent.click(c.getByRole('option', { name: /India/ }));
    await expect(c.getByText('+9155512345')).toBeVisible();
  },
};

export const CountryKeyboard: Story = {
  parameters: { docs: { description: { story: 'Tab to the country trigger, ArrowDown opens, type "I" to jump to a country starting with I, Enter chooses; Escape closes without choosing.' } } },
  render: (args) => <Controlled {...args} initial="+97455512345" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const trigger = c.getByRole('combobox', { name: /Country calling code/ });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{ArrowDown}{End}{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const FixedCountry: Story = {
  args: { fixedIso: 'QA', maxNationalDigits: 8, helperText: 'Alternate number: +974 followed by 8 digits.' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('combobox')).toBeNull();
  },
};

export const MaskedNumber: Story = {
  args: { maskedDisplay: '5******1', helperText: 'Click to replace the masked number.' },
  render: (args) => <Controlled {...args} initial="+97455512341" />,
};

export const Focus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await userEvent.tab();
    await expect(within(canvasElement).getByLabelText('Mobile number')).toHaveFocus();
  },
};

export const Hover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByLabelText('Mobile number'));
  },
};

export const Required: Story = {
  args: { required: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText('Mobile number', { exact: false })).toHaveAttribute('aria-required', 'true');
  },
};

export const Optional: Story = { args: { label: 'Alternate number', helperText: 'Optional', noAutoFocus: true } };

export const ReadOnly: Story = {
  args: { readOnly: true },
  render: (args) => <Controlled {...args} initial="+97455512345" />,
};

export const ValidationError: Story = {
  args: { required: true, error: 'Enter a Qatar mobile number: 8 digits starting with 3, 5, 6 or 7.' },
  render: (args) => <Controlled {...args} initial="+974123" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByLabelText('Mobile number', { exact: false })).toHaveAttribute('aria-invalid', 'true');
    await expect(c.getByRole('alert')).toBeVisible();
  },
};

export const AllStates: Story = {
  render: () => (
    <Row>
      <Specimen label="Empty"><Controlled label="Mobile" /></Specimen>
      <Specimen label="Populated"><Controlled label="Mobile" initial="+97455512345" /></Specimen>
      <Specimen label="Pinned country"><Controlled label="Mobile" fixedIso="QA" initial="+97455512345" /></Specimen>
      <Specimen label="Read-only"><Controlled label="Mobile" readOnly initial="+97455512345" /></Specimen>
      <Specimen label="Error"><Controlled label="Mobile" error="Invalid number." initial="+974123" /></Specimen>
    </Row>
  ),
};
