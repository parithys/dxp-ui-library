import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ChoiceCards, CARD_ICON, MAIL_ICON, PHONE_ICON } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Column } from '../_shared/layout';

const meta = {
  title: 'Forms/Choice Cards',
  component: ChoiceCards,
  parameters: { ...docsParameters({ purpose: 'ChoiceCards (src/components/primitives/ChoiceCards.tsx): single choice only (no multi-select) shown as icon cards; role="radiogroup" named by `name` or the legend, each card a role="radio" button with aria-checked. Cards are plain buttons, so Tab visits each and Enter / Space chooses (arrow keys do not move between them). `tone` colours the chosen card by status (success / warn / danger / neutral).', source: 'src/components/primitives/ChoiceCards.tsx' }) },
  args: { legend: 'Channel', items: [], value: undefined, onChange: fn() },
} satisfies Meta<typeof ChoiceCards>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => {
    const [channel, setChannel] = useState<'sms' | 'email' | 'call' | undefined>('sms');
    const [status, setStatus] = useState<'ok' | 'wait' | 'no' | undefined>(undefined);
    return (
      <Column>
        <ChoiceCards legend="Preferred contact channel" value={channel} onChange={setChannel} items={[{ key: 'sms', label: 'SMS', icon: PHONE_ICON }, { key: 'email', label: 'Email', icon: MAIL_ICON }, { key: 'call', label: 'Call', icon: CARD_ICON }]} />
        <ChoiceCards legend="Outcome (toned cards)" value={status} onChange={setStatus} items={[{ key: 'ok', label: 'Approved', icon: CARD_ICON, tone: 'success' }, { key: 'wait', label: 'Pending', icon: CARD_ICON, tone: 'warn' }, { key: 'no', label: 'Rejected', icon: CARD_ICON, tone: 'danger' }]} />
      </Column>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('radio', { name: 'SMS' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(c.getByRole('radio', { name: 'Email' }));
    await expect(c.getByRole('radio', { name: 'Email' })).toHaveAttribute('aria-checked', 'true');
    await expect(c.getByRole('radio', { name: 'SMS' })).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(c.getByRole('radio', { name: 'Approved' }));
    await expect(c.getByRole('radio', { name: 'Approved' })).toHaveAttribute('aria-checked', 'true');
  },
};

