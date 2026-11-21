import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Checkbox, Label } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Column, Row, Specimen } from '../_shared/layout';

const meta = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  parameters: {
    ...docsParameters({
      purpose: 'The app\'s checkbox on Radix: an 18px square, red fill and white tick when checked. Used alone (consent, terms) or as a group of independent options.',
      source: 'src/components/ui/checkbox.tsx',
      states: ['Unchecked', 'Checked', 'Indeterminate (Radix reports it; the app draws the tick for it)', 'Hover', 'Focus (visible ring)', 'Disabled'],
      events: ['onCheckedChange(checked: boolean | "indeterminate") - a boolean, not a change event. Use `checked === true`.'],
      usage: [
        'It is a button with role="checkbox", not a native input: state is in aria-checked / data-state; there is no readOnly.',
        'There is no built-in label or error text: pair it with a <Label htmlFor> and put the message beside it (see Forms/Validation).',
        'A group is simply several checkboxes in a labelled container; there is no group component.',
      ],
      accessibility: [
        'Space toggles; Tab moves between boxes. Always give a name: a <Label htmlFor> with the checkbox id, or aria-label.',
        'Pass `required` and `aria-invalid` yourself when the box is mandatory or failed validation.',
      ],
    }),
  },
  argTypes: {
    checked: { control: 'select', options: [true, false, 'indeterminate'], description: 'Controlled state.' },
    disabled: { control: 'boolean', description: 'Unavailable.' },
    required: { control: 'boolean', description: 'Sets aria-required semantics.' },
    onCheckedChange: { action: 'checked changed' },
  },
  args: { onCheckedChange: fn(), 'aria-label': 'Accept' },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

function Labelled({ id, label, defaultChecked, disabled }: { id: string; label: string; defaultChecked?: boolean; disabled?: boolean }) {
  return (
    <div className="row gap-2">
      <Checkbox id={id} defaultChecked={defaultChecked} disabled={disabled} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}

export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="row gap-2">
        <Checkbox {...args} id="cb-default" aria-label={undefined} checked={checked} onCheckedChange={(c) => { setChecked(c === true); args.onCheckedChange?.(c); }} />
        <Label htmlFor="cb-default">I confirm the customer has seen the terms</Label>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox', { name: 'I confirm the customer has seen the terms' });
    await expect(box).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(box);
    await expect(box).toHaveAttribute('aria-checked', 'true');
  },
};

export const Checked: Story = { args: { checked: true } };
export const Unchecked: Story = { args: { checked: false } };
export const Indeterminate: Story = { args: { checked: 'indeterminate' } };

export const Disabled: Story = {
  render: () => (
    <Row>
      <Specimen label="Disabled, unchecked"><Labelled id="cb-d1" label="Marketing SMS" disabled /></Specimen>
      <Specimen label="Disabled, checked"><Labelled id="cb-d2" label="Marketing SMS" disabled defaultChecked /></Specimen>
    </Row>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('checkbox')[0]).toBeDisabled();
  },
};

export const Hover: Story = {
  render: () => <Labelled id="cb-hover" label="Hover me" />,
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('checkbox'));
  },
};

export const FocusAndKeyboard: Story = {
  render: () => <Labelled id="cb-focus" label="Toggle with Space" />,
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox');
    await userEvent.tab();
    await expect(box).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(box).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard(' ');
    await expect(box).toHaveAttribute('aria-checked', 'false');
  },
};

export const Required: Story = {
  render: () => (
    <div className="row gap-2">
      <Checkbox id="cb-req" required aria-required="true" />
      <Label htmlFor="cb-req">
        I accept the terms and conditions<span className="text-[var(--field-border-error)]" aria-hidden="true">{' *'}</span>
      </Label>
    </div>
  ),
};

export const ValidationError: Story = {
  render: () => (
    <div className="stack gap-1">
      <div className="row gap-2">
        <Checkbox id="cb-err" aria-invalid="true" aria-describedby="cb-err-msg" />
        <Label htmlFor="cb-err">I accept the terms and conditions</Label>
      </div>
      <span id="cb-err-msg" role="alert" className="text-[length:var(--fs-caption)] text-[var(--field-border-error)]">Accept the terms to continue.</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
    await expect(c.getByRole('alert')).toBeVisible();
  },
};

/** A group of independent options, with a "select all" box that goes indeterminate. */
export const Group: Story = {
  render: () => {
    const options = ['SMS', 'Email', 'WhatsApp'];
    const [picked, setPicked] = useState<string[]>(['Email']);
    const all = picked.length === options.length ? true : picked.length === 0 ? false : 'indeterminate';
    return (
      <div role="group" aria-labelledby="cb-group-label" className="stack gap-2">
        <p id="cb-group-label" className="caption-heading">Contact preferences</p>
        <div className="row gap-2">
          <Checkbox id="cb-all" checked={all} onCheckedChange={(c) => setPicked(c === true ? options : [])} />
          <Label htmlFor="cb-all">All channels</Label>
        </div>
        {options.map((o) => (
          <div key={o} className="row gap-2">
            <Checkbox id={`cb-${o}`} checked={picked.includes(o)} onCheckedChange={(c) => setPicked((p) => (c === true ? [...p, o] : p.filter((x) => x !== o)))} />
            <Label htmlFor={`cb-${o}`}>{o}</Label>
          </div>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const all = c.getByRole('checkbox', { name: 'All channels' });
    await expect(all).toHaveAttribute('aria-checked', 'mixed');
    await userEvent.click(c.getByRole('checkbox', { name: 'SMS' }));
    await userEvent.click(c.getByRole('checkbox', { name: 'WhatsApp' }));
    await expect(all).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(all);
    await expect(c.getByRole('checkbox', { name: 'Email' })).toHaveAttribute('aria-checked', 'false');
  },
};

export const AllStates: Story = {
  render: () => (
    <Column>
      <Row>
        <Specimen label="Unchecked"><Checkbox aria-label="Unchecked" /></Specimen>
        <Specimen label="Checked"><Checkbox aria-label="Checked" checked onCheckedChange={fn()} /></Specimen>
        <Specimen label="Indeterminate"><Checkbox aria-label="Indeterminate" checked="indeterminate" onCheckedChange={fn()} /></Specimen>
        <Specimen label="Disabled"><Checkbox aria-label="Disabled" disabled /></Specimen>
        <Specimen label="Disabled, checked"><Checkbox aria-label="Disabled checked" disabled checked onCheckedChange={fn()} /></Specimen>
        <Specimen label="Invalid"><Checkbox aria-label="Invalid" aria-invalid="true" /></Specimen>
      </Row>
    </Column>
  ),
};
