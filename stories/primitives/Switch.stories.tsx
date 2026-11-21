import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Switch, Label } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Column, Row, Specimen } from '../_shared/layout';

const meta = {
  title: 'Forms/Switch',
  component: Switch,
  parameters: { ...docsParameters({ purpose: 'Switch (src/components/primitives/Switch.tsx): Radix switch, role="switch", state in aria-checked, boolean through onCheckedChange. Space toggles. It has no label of its own: wrap it in a label or give it aria-label.', source: 'src/components/primitives/Switch.tsx' }) },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => {
    const [on, setOn] = useState(false);
    return (
      <Column>
        <div className="row gap-2"><Switch id="sw-sms" checked={on} onCheckedChange={setOn} /><Label htmlFor="sw-sms">SMS alerts</Label></div>
        <Row>
          <Specimen label="Off"><Switch aria-label="Off" /></Specimen>
          <Specimen label="On"><Switch aria-label="On" checked onCheckedChange={fn()} /></Specimen>
          <Specimen label="Disabled"><Switch aria-label="Disabled" disabled /></Specimen>
          <Specimen label="Disabled, on"><Switch aria-label="Disabled on" disabled checked onCheckedChange={fn()} /></Specimen>
        </Row>
      </Column>
    );
  },
  play: async ({ canvasElement }) => {
    const sw = within(canvasElement).getByRole('switch', { name: 'SMS alerts' });
    await expect(sw).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(sw);
    await expect(sw).toHaveAttribute('aria-checked', 'true');
    sw.focus();
    await userEvent.keyboard(' ');
    await expect(sw).toHaveAttribute('aria-checked', 'false');
  },
};
