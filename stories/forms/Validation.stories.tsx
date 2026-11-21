import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Input, Select, PhoneNumberInput, DateInput, Checkbox, Label, Button, parseDmy } from '../../src';
import { docsParameters } from '../_shared/docs';

interface Values {
  name: string;
  email: string;
  idType: string;
  mobile: string;
  dob: string;
  terms: boolean;
}
type Errors = Partial<Record<keyof Values, string>>;
const EMPTY: Values = { name: '', email: '', idType: '', mobile: '', dob: '', terms: false };
const ID_TYPES = [{ value: 'qid', label: 'Qatar ID (QID)' }, { value: 'passport', label: 'Passport' }, { value: 'gcc', label: 'GCC ID' }];

/** The rules of this demo form (the app's components only display errors; each journey owns its own rules). */
function rule(field: keyof Values, v: Values): string | undefined {
  switch (field) {
    case 'name': return v.name.trim() ? undefined : 'Enter the full name.';
    case 'email': return v.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email) ? 'Enter a valid email address.' : undefined;
    case 'idType': return v.idType ? undefined : 'Choose an ID type.';
    case 'mobile': return /^\+974[3567]\d{7}$/.test(v.mobile) ? undefined : 'Enter a Qatar mobile number: 8 digits starting with 3, 5, 6 or 7.';
    case 'dob': return parseDmy(v.dob) ? undefined : 'Enter a real date as DD/MM/YYYY.';
    case 'terms': return v.terms ? undefined : 'Accept the terms to continue.';
  }
}
const FIELDS: (keyof Values)[] = ['name', 'email', 'idType', 'mobile', 'dob', 'terms'];

function ValidationForm({ mode }: { mode: 'blur' | 'submit' }) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof Values>(k: K, v: Values[K]) => {
    const next = { ...values, [k]: v };
    setValues(next);
    // After a field has shown an error, fixing it clears the message straight away.
    if (errors[k]) setErrors((e) => ({ ...e, [k]: rule(k, next) }));
  };
  const check = (k: keyof Values, v: Values = values) => setErrors((e) => ({ ...e, [k]: rule(k, v) }));
  const blur = (k: keyof Values) => () => mode === 'blur' && check(k);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const all: Errors = {};
    for (const f of FIELDS) all[f] = rule(f, values);
    setErrors(all);
    const hasError = FIELDS.some((f) => all[f]);
    setSubmitted(!hasError);
    // Focus moves to the first invalid field once React has drawn aria-invalid.
    if (hasError) requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  };

  return (
    <form ref={formRef} noValidate onSubmit={submit} aria-label="Customer details" className="stack gap-4" style={{ maxWidth: 420, minHeight: 640 }}>
      <Input label="Full name" required value={values.name} error={errors.name} onChange={(e) => set('name', e.target.value)} onBlur={blur('name')} />
      <Input label="Email" type="email" helperText="Optional" value={values.email} error={errors.email} onChange={(e) => set('email', e.target.value)} onBlur={blur('email')} />
      <Select label="ID type" required options={ID_TYPES} value={values.idType} error={errors.idType} onChange={(e) => { set('idType', e.target.value); check('idType', { ...values, idType: e.target.value }); }} />
      <PhoneNumberInput label="Mobile number" required fixedIso="QA" maxNationalDigits={8} value={values.mobile} error={errors.mobile} onChange={(e) => set('mobile', e.target.value)} />
      <DateInput label="Date of birth" required value={values.dob} error={errors.dob} onChange={(e) => set('dob', e.target.value)} onBlur={(e) => { const t = e.target.value; check('dob', { ...values, dob: t }); }} />
      <div className="stack gap-1">
        <div className="row gap-2">
          <Checkbox id="vf-terms" required aria-required="true" aria-invalid={errors.terms ? true : undefined} aria-describedby={errors.terms ? 'vf-terms-error' : undefined} checked={values.terms} onCheckedChange={(c) => { set('terms', c === true); check('terms', { ...values, terms: c === true }); }} />
          <Label htmlFor="vf-terms">I confirm the customer accepts the terms<span className="text-[var(--field-border-error)]" aria-hidden="true">{' *'}</span></Label>
        </div>
        {errors.terms && <span id="vf-terms-error" role="alert" className="text-[length:var(--fs-caption)] text-[var(--field-border-error)]">{errors.terms}</span>}
      </div>
      <div className="row gap-2">
        <Button type="submit">Continue</Button>
        <Button type="button" variant="secondary" onClick={() => { setValues(EMPTY); setErrors({}); setSubmitted(false); }}>Reset</Button>
      </div>
      {submitted && <p role="status" className="body-text">All fields are valid.</p>}
    </form>
  );
}

const meta = {
  title: 'Forms/Validation',
  parameters: {
    ...docsParameters({
      purpose: 'A compact form built from the real Input, Select, PhoneNumberInput, DateInput and Checkbox, showing how validation is displayed and wired. The components only DISPLAY an error; the owner (a journey step) decides when to raise it - here on blur and on submit.',
      source: 'src/components/primitives/Input.tsx, Select.tsx, PhoneNumberInput.tsx, DateInput.tsx, src/components/ui/checkbox.tsx',
      variants: ['Validate on blur: each field is checked when it loses focus, and again on submit', 'Validate on submit: nothing shows until Continue is pressed'],
      states: ['Pristine', 'Field error (red border + message)', 'Fixed (message clears as soon as the value is valid, once it has been shown)', 'All valid'],
      validation: [
        'An error string passed as `error` draws the red border and the message under the field; it replaces any helper text.',
        'The message is role="alert" and the field gets aria-invalid="true" and aria-describedby pointing at the message id (Input, Select, PhoneNumberInput, DateInput all share this).',
        'Required fields carry aria-required and an aria-hidden asterisk. Optional fields have no marker (use helper text "Optional").',
        'On a failed submit this form moves focus to the first field with aria-invalid="true". The components do not do this themselves.',
        'The Checkbox has no error API: the demo sets aria-invalid / aria-describedby and renders its own role="alert" message beside it.',
      ],
      accessibility: ['Native form with noValidate and a form name; errors are announced by role="alert"; Tab order follows the visual order. The Select takes focus by opening its list, so on a failed submit the list opens when it is the first invalid field.'],
      restrictions: ['The rules (name required, +974 mobile, real date) are demo rules written for this story, not the app\'s business rules.'],
    }),
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const OnSubmit: Story = {
  render: () => <ValidationForm mode="submit" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('alert')).toBeNull();
    await userEvent.click(c.getByRole('button', { name: 'Continue' }));
    const name = c.getByLabelText('Full name', { exact: false });
    await waitFor(() => expect(name).toHaveAttribute('aria-invalid', 'true'));
    // The form moves focus in a requestAnimationFrame, so it lands a frame after the errors are drawn.
    await waitFor(() => expect(name).toHaveFocus());
    await expect(name.getAttribute('aria-describedby')).toContain('-error');
    await expect(c.getAllByRole('alert').length).toBeGreaterThanOrEqual(5);
  },
};

export const OnBlur: Story = {
  render: () => <ValidationForm mode="blur" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const name = c.getByLabelText('Full name', { exact: false });
    await userEvent.click(name);
    await userEvent.tab();
    await expect(c.getByText('Enter the full name.')).toBeVisible();
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(name, 'Aisha');
    await expect(c.queryByText('Enter the full name.')).toBeNull();
    await expect(name).not.toHaveAttribute('aria-invalid');
  },
};

export const InvalidFormats: Story = {
  render: () => <ValidationForm mode="blur" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const email = c.getByLabelText('Email');
    await userEvent.type(email, 'not-an-email');
    await userEvent.tab();
    await expect(c.getByText('Enter a valid email address.')).toBeVisible();
    const dob = c.getByLabelText('Date of birth', { exact: false });
    await userEvent.type(dob, '31022026');
    await userEvent.tab();
    await waitFor(() => expect(c.getByText('Enter a real date as DD/MM/YYYY.')).toBeVisible());
  },
};

export const FixAndSubmit: Story = {
  render: () => <ValidationForm mode="submit" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByLabelText('Full name', { exact: false }), 'Aisha Al Thani');
    const id = c.getByRole('combobox', { name: /ID type/ });
    await userEvent.click(id);
    await userEvent.click(await c.findByRole('option', { name: 'Qatar ID (QID)' }));
    await userEvent.type(c.getByLabelText('Mobile number', { exact: false }), '55512345');
    await userEvent.type(c.getByLabelText('Date of birth', { exact: false }), '15/03/1990');
    await userEvent.click(c.getByRole('checkbox'));
    await userEvent.click(c.getByRole('button', { name: 'Continue' }));
    await expect(await c.findByText('All fields are valid.')).toBeVisible();
    await expect(c.queryByRole('alert')).toBeNull();
  },
};

export const CheckboxError: Story = {
  render: () => <ValidationForm mode="submit" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Continue' }));
    const box = c.getByRole('checkbox');
    await waitFor(() => expect(box).toHaveAttribute('aria-invalid', 'true'));
    await expect(box).toHaveAttribute('aria-describedby', 'vf-terms-error');
    await userEvent.click(box);
    await expect(c.queryByText('Accept the terms to continue.')).toBeNull();
  },
};

export const SelectErrorAssociation: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Select label="ID type" required options={ID_TYPES} value="" error="Choose an ID type." onChange={fn()} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByRole('combobox');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field.getAttribute('aria-describedby')).toBe(c.getByRole('alert').id);
  },
};
