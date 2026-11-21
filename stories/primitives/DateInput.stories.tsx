import { useState } from 'react';
import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { DateInput, compareYmd, parseDmy, parseIso } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Row, SideBySide, Specimen } from '../_shared/layout';

type DateArgs = ComponentProps<typeof DateInput>;

function Controlled({ initial = '', ...args }: Omit<DateArgs, 'value' | 'onChange'> & { initial?: string; onChange?: DateArgs['onChange'] }) {
  const [value, setValue] = useState(initial);
  return (
    <div style={{ maxWidth: 320, minHeight: 380 }}>
      <DateInput {...args} value={value} onChange={(e) => { setValue(e.target.value); args.onChange?.(e); }} />
    </div>
  );
}

/** Validation owned by the caller: the field only types and picks, so a range is checked here. */
function Validated({ min, max }: { min: string; max: string }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>();
  const check = () => {
    const d = parseDmy(value);
    const lo = parseDmy(min);
    const hi = parseDmy(max);
    if (!value) setError('Enter the expiry date.');
    else if (!d) setError('Enter a real date as DD/MM/YYYY.');
    else if (lo && compareYmd(d, lo) < 0) setError(`The date cannot be before ${min}.`);
    else if (hi && compareYmd(d, hi) > 0) setError(`The date cannot be after ${max}.`);
    else setError(undefined);
  };
  return (
    <div style={{ maxWidth: 320 }}>
      <DateInput label="ID expiry date" required value={value} min={min} max={max} error={error} onChange={(e) => setValue(e.target.value)} onBlur={check} />
    </div>
  );
}

const meta = {
  title: 'Forms/Date Input',
  component: DateInput,
  parameters: {
    ...docsParameters({
      purpose: 'The app\'s date field: type DD/MM/YYYY or pick from the calendar opened by the icon at the right edge. Every date an agent enters uses it.',
      source: 'src/components/primitives/DateInput.tsx, src/lib/dateField.ts',
      variants: ['format="dmy" (default): the stored value is the typed DD/MM/YYYY text, tidied on blur', 'format="iso": the stored value is YYYY-MM-DD, or "" while the typed text is not yet a real date'],
      states: ['Empty', 'Populated', 'Calendar open', 'Focus', 'Disabled (calendar button disabled too)', 'Read-only (calendar button disabled)', 'Required', 'Error (from the owner)', 'Days outside min / max switched off in the calendar'],
      events: ['onChange(e): `e.target.value` is the stored value (DD/MM/YYYY in dmy, ISO in iso). onBlur replaces the built-in tidy-up when given.'],
      usage: [
        'Typing accepts digits and / . - space; "30112029", "1.2.2030" are tidied to DD/MM/YYYY on blur. The field is capped at 10 characters with a numeric keypad on touch.',
        '`min` / `max` are given in the same format as the stored value. They limit what the calendar offers; a TYPED date outside them is not rejected by the field - the owner validates (see "Validated range").',
        'The year list runs from 1900 (or min) to 30 years ahead (or max). The week starts on Saturday (Qatar working week).',
        'Accepts every Input prop except type, inputMode, maxLength and trailingAddon (label, error, helperText, required, disabled, readOnly ...).',
      ],
      validation: ['The field draws error text and aria-invalid like Input; it does not decide validity itself.'],
      accessibility: [
        'The calendar button is "Choose date" (aria-haspopup="dialog", aria-expanded). The panel is role="dialog" "Choose date" with a role="grid"; each day is a button named like "20 March 2026", aria-selected when chosen, aria-current="date" for today, disabled outside min / max.',
        'In the grid: ArrowLeft/Right move by a day, ArrowUp/Down by a week, PageUp/PageDown by a month, Enter or Space picks, Escape closes and returns focus to the calendar button. Month and Year are searchable Selects.',
        'Choosing a day closes the panel and returns focus to the calendar button.',
      ],
      devices: ['Field height follows --control-h-md (2.625rem Web, 3rem Tablet); the calendar button and days use the same device scale. Both entry paths exist on every device.'],
    }),
  },
  argTypes: {
    label: { control: 'text', description: 'Visible label.' },
    helperText: { control: 'text', description: 'Muted text under the field.' },
    error: { control: 'text', description: 'Error message from the owner.' },
    required: { control: 'boolean', description: 'Asterisk and aria-required.' },
    disabled: { control: 'boolean', description: 'Unavailable, calendar button disabled.' },
    readOnly: { control: 'boolean', description: 'Shown, not editable, calendar button disabled.' },
    format: { control: 'select', options: ['dmy', 'iso'], description: 'How the value is stored.' },
    min: { control: 'text', description: 'Earliest date, in the stored format.' },
    max: { control: 'text', description: 'Latest date, in the stored format.' },
    value: { control: false },
    onChange: { action: 'changed' },
  },
  args: { label: 'Date of birth', value: '', onChange: fn() },
  render: (args) => <Controlled {...args} />,
} satisfies Meta<typeof DateInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Populated: Story = { render: (args) => <Controlled {...args} initial="15/03/1990" /> };

export const TypeAndTidy: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByLabelText('Date of birth');
    await userEvent.type(field, '30112029');
    await userEvent.tab();
    await expect(field).toHaveValue('30/11/2029');
  },
};

export const LettersAreIgnored: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByLabelText('Date of birth');
    await userEvent.type(field, '1a2b/0c3');
    await expect(field).toHaveValue('12/03');
  },
};

export const PickFromCalendar: Story = {
  render: (args) => <Controlled {...args} initial="15/03/2026" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Choose date' }));
    await expect(c.getByRole('dialog', { name: 'Choose date' })).toBeVisible();
    await userEvent.click(c.getByRole('gridcell', { name: '20 March 2026' }));
    await expect(c.getByLabelText('Date of birth')).toHaveValue('20/03/2026');
    await waitFor(() => expect(c.queryByRole('dialog')).toBeNull());
  },
};

export const CalendarKeyboard: Story = {
  parameters: { docs: { description: { story: 'Open the calendar with the button, ArrowRight / ArrowDown move the focused day, Enter picks, Escape closes.' } } },
  render: (args) => <Controlled {...args} initial="15/03/2026" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Choose date' }));
    const day = c.getByRole('gridcell', { name: '15 March 2026' });
    day.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowDown}');
    await expect(c.getByRole('gridcell', { name: '23 March 2026' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(c.getByLabelText('Date of birth')).toHaveValue('23/03/2026');
    await userEvent.click(c.getByRole('button', { name: 'Choose date' }));
    // Escape is handled by the panel, so focus is inside it (on the chosen day) when it is pressed.
    c.getByRole('gridcell', { name: '23 March 2026' }).focus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(c.queryByRole('dialog')).toBeNull());
    await expect(c.getByRole('button', { name: 'Choose date' })).toHaveFocus();
  },
};

export const MinMax: Story = {
  args: { label: 'Appointment date', min: '10/03/2026', max: '20/03/2026' },
  render: (args) => <Controlled {...args} initial="15/03/2026" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Choose date' }));
    await expect(c.getByRole('gridcell', { name: '5 March 2026' })).toBeDisabled();
    await expect(c.getByRole('gridcell', { name: '12 March 2026' })).toBeEnabled();
    await expect(c.getByRole('gridcell', { name: '25 March 2026' })).toBeDisabled();
  },
};

export const IsoFormat: Story = {
  args: { format: 'iso', label: 'Contract start' },
  parameters: { docs: { description: { story: 'The field shows DD/MM/YYYY but stores YYYY-MM-DD, or an empty string while the typed text is not a real date.' } } },
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <div className="stack gap-2" style={{ maxWidth: 320, minHeight: 380 }}>
        <DateInput {...args} value={value} onChange={(e) => setValue(e.target.value)} />
        <p className="caption-muted">Stored value: <code>{value || '(empty)'}</code></p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByLabelText('Contract start'), '05/07/2027');
    await expect(c.getByText('2027-07-05')).toBeVisible();
    await expect(parseIso('2027-07-05')).toBeTruthy();
  },
};

export const Focus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByLabelText('Date of birth')).toHaveFocus();
  },
};

export const Hover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByLabelText('Date of birth'));
  },
};

export const Required: Story = {
  args: { required: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText('Date of birth', { exact: false })).toHaveAttribute('aria-required', 'true');
  },
};

export const Optional: Story = { args: { label: 'Anniversary date', helperText: 'Optional. DD/MM/YYYY' } };

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <Controlled {...args} initial="15/03/1990" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByLabelText('Date of birth')).toBeDisabled();
    await expect(c.getByRole('button', { name: 'Choose date' })).toBeDisabled();
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true },
  render: (args) => <Controlled {...args} initial="15/03/1990" />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Choose date' })).toBeDisabled();
  },
};

export const ValidationError: Story = {
  args: { required: true, error: 'Enter a real date as DD/MM/YYYY.' },
  render: (args) => <Controlled {...args} initial="31/02/2026" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByLabelText('Date of birth', { exact: false })).toHaveAttribute('aria-invalid', 'true');
    await expect(c.getByRole('alert')).toBeVisible();
  },
};

export const ValidatedRange: Story = {
  name: 'Validated range (owner-side)',
  parameters: { docs: { description: { story: 'The field does not reject a typed date outside min / max; the caller does, here on blur using the shared helpers in src/lib/dateField.ts.' } } },
  render: () => <Validated min="01/01/2026" max="31/12/2030" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByLabelText('ID expiry date', { exact: false });
    // The owner's onBlur replaces the built-in tidy-up, so the date is typed in full DD/MM/YYYY.
    await userEvent.type(field, '01/01/2020');
    await userEvent.tab();
    await expect(c.getByRole('alert')).toHaveTextContent('cannot be before');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
  },
};

export const WebAndTablet: Story = {
  name: 'Web vs Tablet',
  parameters: { docs: { description: { story: 'The field reads the device from the app (lib/deviceType.ts): the toolbar Device switch (or ?device=tablet) selects the experience. On Tablet the control height is 3rem instead of 2.625rem.' } } },
  render: () => (
    <SideBySide>
      <Specimen label="Rendered for the selected Device"><Controlled label="Date of birth" initial="15/03/1990" /></Specimen>
    </SideBySide>
  ),
};

export const AllStates: Story = {
  render: () => (
    <Row>
      <Specimen label="Empty"><Controlled label="Date" /></Specimen>
      <Specimen label="Populated"><Controlled label="Date" initial="15/03/1990" /></Specimen>
      <Specimen label="Required"><Controlled label="Date" required /></Specimen>
      <Specimen label="Disabled"><Controlled label="Date" disabled initial="15/03/1990" /></Specimen>
      <Specimen label="Read-only"><Controlled label="Date" readOnly initial="15/03/1990" /></Specimen>
      <Specimen label="Error"><Controlled label="Date" error="Enter a real date." initial="31/02/2026" /></Specimen>
    </Row>
  ),
};
