import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { OptionToggle } from '../../src';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Forms/Option Toggle',
  component: OptionToggle,
  parameters: { ...docsParameters({ purpose: 'OptionToggle (src/components/primitives/OptionToggle.tsx): mutually exclusive values of ONE field (billing frequency). role="radiogroup" with role="radio" buttons, one in the Tab order; ArrowLeft/Right/Up/Down wrap, Home/End jump, and each arrow chooses. Not navigation - tabs switch content. No disabled state.', source: 'src/components/primitives/OptionToggle.tsx' }) },
  args: { items: [], active: undefined, onChange: fn(), label: 'Billing frequency' },
} satisfies Meta<typeof OptionToggle>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => {
    const [freq, setFreq] = useState<'monthly' | 'weekly' | 'once'>('monthly');
    return <OptionToggle label="Billing frequency" active={freq} onChange={setFreq} items={[{ key: 'monthly', label: 'Monthly' }, { key: 'weekly', label: 'Weekly' }, { key: 'once', label: 'One-Time' }]} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const monthly = c.getByRole('radio', { name: 'Monthly' });
    monthly.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(c.getByRole('radio', { name: 'Weekly' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{End}');
    await expect(c.getByRole('radio', { name: 'One-Time' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(monthly).toHaveAttribute('aria-checked', 'true');
  },
};

