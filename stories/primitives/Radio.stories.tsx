import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Radio, Label } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Row, Specimen } from '../_shared/layout';

const meta = {
  title: 'Forms/Radio',
  component: Radio,
  parameters: {
    ...docsParameters({
      purpose: 'A native radio input drawn as an 18px circle that fills red with a white ring when checked. Group radios by giving them one `name`.',
      source: 'src/components/primitives/Radio.tsx',
      states: ['Unchecked', 'Checked', 'Hover', 'Focus', 'Disabled'],
      events: ['onChange: native change event (all input props pass through except `type`).'],
      usage: [
        'The real <input type="radio"> stays in the DOM, so the browser provides grouping and arrow-key behaviour.',
        'There is no label or group component: wrap each in a <label> or pair with <Label htmlFor>, and put the group in a role="radiogroup" / fieldset with a name.',
        'For a few icon cards use ChoiceCards (Forms/Choice Cards); for values of one field in a pill track use OptionToggle (Forms/Option Toggle).',
      ],
      accessibility: ['Native semantics: Tab enters the group once, ArrowUp/Down/Left/Right move and select, Space selects. The white centre is aria-hidden and never takes clicks.'],
    }),
  },
  argTypes: {
    checked: { control: 'boolean', description: 'Controlled checked state.' },
    disabled: { control: 'boolean', description: 'Unavailable.' },
    name: { control: 'text', description: 'Group name.' },
    onChange: { action: 'changed' },
  },
  args: { name: 'single', 'aria-label': 'Option', onChange: fn() },
} satisfies Meta<typeof Radio>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { checked: true, readOnly: true } };
export const Disabled: Story = { args: { disabled: true } };

export const Group: Story = {
  render: () => {
    const [picked, setPicked] = useState('prepaid');
    const options = [{ v: 'prepaid', l: 'Prepaid' }, { v: 'postpaid', l: 'Postpaid' }, { v: 'hybrid', l: 'Hybrid', disabled: true }];
    return (
      <div role="radiogroup" aria-labelledby="radio-legend" className="stack gap-2">
        <p id="radio-legend" className="caption-heading">Connection type</p>
        {options.map((o) => (
          <div key={o.v} className="row gap-2">
            <Radio id={`radio-${o.v}`} name="conn" value={o.v} checked={picked === o.v} disabled={o.disabled} onChange={() => setPicked(o.v)} />
            <Label htmlFor={`radio-${o.v}`}>{o.l}</Label>
          </div>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const prepaid = c.getByRole('radio', { name: 'Prepaid' });
    const postpaid = c.getByRole('radio', { name: 'Postpaid' });
    await userEvent.tab();
    await expect(prepaid).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(postpaid).toBeChecked();
    await expect(prepaid).not.toBeChecked();
    await userEvent.click(prepaid);
    await expect(prepaid).toBeChecked();
  },
};

export const Hover: Story = {
  render: () => (
    <div className="row gap-2"><Radio id="radio-hover" name="h" aria-label="Hover" /><Label htmlFor="radio-hover">Hover me</Label></div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('radio'));
  },
};

export const FocusRing: Story = {
  render: () => (
    <div className="row gap-2"><Radio id="radio-focus" name="f" aria-label="Focus" /><Label htmlFor="radio-focus">Focus me</Label></div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('radio')).toHaveFocus();
  },
};

export const AllStates: Story = {
  render: () => (
    <Row>
      <Specimen label="Unchecked"><Radio name="s1" aria-label="Unchecked" /></Specimen>
      <Specimen label="Checked"><Radio name="s2" aria-label="Checked" checked readOnly /></Specimen>
      <Specimen label="Disabled"><Radio name="s3" aria-label="Disabled" disabled /></Specimen>
      <Specimen label="Disabled, checked"><Radio name="s4" aria-label="Disabled checked" disabled checked readOnly /></Specimen>
    </Row>
  ),
};
