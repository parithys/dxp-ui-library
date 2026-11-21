import { useState } from 'react';
import type { ChangeEvent, ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Select } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Row, Specimen } from '../_shared/layout';

type SelectArgs = ComponentProps<typeof Select>;

const PLANS = [
  { value: 'red-basic', label: 'Red Basic' },
  { value: 'red-plus', label: 'Red Plus' },
  { value: 'red-premium', label: 'Red Premium' },
  { value: 'business-lite', label: 'Business Lite' },
  { value: 'business-pro', label: 'Business Pro' },
  { value: 'visitor', label: 'Visitor SIM' },
  { value: 'prepaid-hala', label: 'Hala Prepaid' },
  { value: 'prepaid-super', label: 'Super Prepaid' },
  { value: 'fibre-100', label: 'Fibre 100 Mbps' },
  { value: 'fibre-500', label: 'Fibre 500 Mbps' },
];

function Controlled({ initial = '', ...args }: SelectArgs & { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <div style={{ maxWidth: 360, minHeight: 320 }}>
      <Select {...args} value={value} onChange={(e: ChangeEvent<HTMLSelectElement>) => { setValue(e.target.value); args.onChange?.(e); }} />
    </div>
  );
}

const meta = {
  title: 'Forms/Select',
  component: Select,
  parameters: {
    ...docsParameters({
      purpose: 'The app\'s one dropdown: a searchable combobox. The field itself takes typing, the list narrows as the agent types, a chevron opens it. Every dropdown in the app is this component (PROTECTED - there is no shadcn Select in the repo, on purpose).',
      source: 'src/components/primitives/Select.tsx',
      variants: ['Light (default)', '`dark`: dark-panel skin used on the login page Role field', '`openUp`: list opens above the field', '`tintedPanel`: tinted list surface for use over a same-coloured panel (drawer, modal footer)'],
      states: ['Empty (nothing chosen)', 'Open', 'Filtering (typed text)', 'No matches', 'Selected', 'Disabled', 'Required', 'Error'],
      events: ['onChange(e): a synthesised `{ target: { value } }` event - read `e.target.value`. Fired only when a row is chosen; typing never changes the value.'],
      usage: [
        'Single choice only: there is no multi-select, and options carry only `value` and `label` (no descriptions or icons).',
        'There is no placeholder: the prop is accepted and ignored. Name the field with `label`, or `aria-label` when there is no visible label (a table filter).',
        '`searchable` is accepted for old call sites; every Select is searchable. Filtering matches the label by substring, case-insensitive.',
        'Leaving the field with text that was not chosen restores the selected label.',
        'Focus or click opens the list; the list opens on the selected option.',
      ],
      validation: ['Error text (role="alert") replaces the helper text; the field gets aria-invalid and the red border. Owner decides when to raise it.'],
      accessibility: [
        'ARIA 1.2 combobox: role="combobox" on the text input, aria-expanded, aria-controls, aria-autocomplete="list", aria-activedescendant naming the highlighted option; list is role="listbox" with role="option" / aria-selected.',
        'Keyboard: ArrowDown / ArrowUp open and move (opening on the selected option), PageDown / PageUp move by 8, Enter chooses the highlighted option, Escape closes the list only (not a dialog around it) and returns focus, Tab closes and moves on. Home / End move the text caret, not the highlight.',
        'Label is bound by htmlFor; aria-required and the aria-hidden asterisk match Input. aria-describedby points at the error, else the helper.',
        'The chevron button is tabIndex -1 (labelled Open list / Close list) so Tab visits the field once.',
        'The empty-results row ("No Matches") is role="status".',
      ],
      devices: ['Field height follows --control-h-md (2.625rem Web, 3rem Tablet); option rows use the same body type.'],
    }),
  },
  argTypes: {
    label: { control: 'text', description: 'Visible label, bound to the combobox.' },
    helperText: { control: 'text', description: 'Muted text under the field; hidden while an error shows.' },
    error: { control: 'text', description: 'Error message.' },
    required: { control: 'boolean', description: 'Asterisk and aria-required.' },
    disabled: { control: 'boolean', description: 'Unavailable.' },
    dark: { control: 'boolean', description: 'Dark-panel skin (login page).' },
    openUp: { control: 'boolean', description: 'Open the list above the field.' },
    tintedPanel: { control: 'boolean', description: 'Tinted list surface.' },
    options: { control: false, description: 'Array of { value, label }.' },
    value: { control: false, description: 'Chosen option value (controlled).' },
    onChange: { action: 'changed' },
  },
  args: { label: 'Plan', options: PLANS, onChange: fn() },
  render: (args) => <Controlled {...args} />,
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Populated: Story = { render: (args) => <Controlled {...args} initial="red-plus" /> };

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('combobox', { name: 'Plan' }));
    await expect(c.getByRole('listbox')).toBeVisible();
    await expect(c.getAllByRole('option')).toHaveLength(PLANS.length);
  },
};

export const Filtering: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByRole('combobox', { name: 'Plan' }), 'fibre');
    await waitFor(() => expect(c.getAllByRole('option')).toHaveLength(2));
  },
};

export const NoMatches: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByRole('combobox', { name: 'Plan' }), 'zzz');
    await expect(c.getByRole('status')).toHaveTextContent('No Matches');
  },
};

export const SelectWithMouse: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const field = c.getByRole('combobox', { name: 'Plan' });
    await userEvent.click(field);
    await userEvent.click(c.getByRole('option', { name: 'Red Premium' }));
    await expect(field).toHaveValue('Red Premium');
    await expect(args.onChange).toHaveBeenCalled();
    await expect(c.queryByRole('listbox')).toBeNull();
  },
};

export const KeyboardNavigation: Story = {
  parameters: { docs: { description: { story: 'Tab to focus (opens the list), ArrowDown twice, Enter chooses; ArrowDown reopens, Escape closes without changing the value.' } } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByRole('combobox', { name: 'Plan' });
    await userEvent.tab();
    await expect(field).toHaveFocus();
    await expect(field).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await expect(field).toHaveValue('Red Premium');
    await userEvent.keyboard('{ArrowDown}');
    await expect(field).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowDown}{Escape}');
    await expect(field).toHaveAttribute('aria-expanded', 'false');
    await expect(field).toHaveValue('Red Premium');
    await expect(field).toHaveFocus();
  },
};

export const TypeToFilterThenEnter: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByRole('combobox', { name: 'Plan' });
    await userEvent.type(field, 'prepaid{ArrowDown}{Enter}');
    await expect(field).toHaveValue('Super Prepaid');
  },
};

export const Focus: Story = {
  play: async () => {
    await userEvent.tab();
  },
};

export const Hover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('combobox', { name: 'Plan' }));
  },
};

export const Required: Story = {
  args: { required: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('combobox')).toHaveAttribute('aria-required', 'true');
  },
};

export const Optional: Story = { args: { label: 'Preferred plan', helperText: 'Optional' } };

export const WithHelperText: Story = { args: { helperText: 'Plans available for the selected ID type.' } };

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <Controlled {...args} initial="red-plus" />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('combobox')).toBeDisabled();
  },
};

export const ValidationError: Story = {
  args: { required: true, error: 'Choose a plan.' },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByRole('combobox');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field.getAttribute('aria-describedby')).toContain('-error');
    await expect(c.getByRole('alert')).toHaveTextContent('Choose a plan.');
  },
};

export const OpenUp: Story = {
  args: { openUp: true },
  render: (args) => (
    <div style={{ maxWidth: 360, paddingTop: 300 }}>
      <Controlled {...args} />
    </div>
  ),
};

export const TintedPanel: Story = { args: { tintedPanel: true } };

export const Dark: Story = {
  parameters: { docs: { description: { story: 'The login-page skin. It is drawn for the dark panel the login page puts behind it, so it is shown here on that panel colour only through the app\'s own tokens.' } } },
  args: { dark: true, label: 'Role' },
};

export const AllStates: Story = {
  render: () => (
    <Row>
      <Specimen label="Empty"><Controlled label="Plan" options={PLANS} /></Specimen>
      <Specimen label="Selected"><Controlled label="Plan" options={PLANS} initial="red-plus" /></Specimen>
      <Specimen label="Required"><Controlled label="Plan" options={PLANS} required /></Specimen>
      <Specimen label="Disabled"><Controlled label="Plan" options={PLANS} disabled initial="red-plus" /></Specimen>
      <Specimen label="Error"><Controlled label="Plan" options={PLANS} error="Choose a plan." /></Specimen>
    </Row>
  ),
};
