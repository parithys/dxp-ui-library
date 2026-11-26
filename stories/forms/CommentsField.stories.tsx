import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CommentsField } from '../../src/components/primitives/CommentsField';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Forms/Comments Field',
  component: CommentsField,
  parameters: {
    ...docsParameters({
      purpose: 'A labelled free-text comments box for the closing step of a guided flow. The label, helper text and placeholder are the caller\'s words; the value is the caller\'s state.',
      source: 'src/components/primitives/CommentsField.tsx (built on src/components/primitives/Textarea.tsx)',
      states: ['Empty (the placeholder shows).', 'Populated.'],
      events: ['`onChange(value: string)` on every keystroke.'],
      accessibility: ['A labelled textarea with its helper text associated, as the Textarea composite does.'],
    }),
  },
  argTypes: {
    value: { control: 'text', description: 'The comment text.' },
    label: { control: 'text', description: 'The field label (default "Comments").' },
    helperText: { control: 'text', description: 'The guidance under the label.' },
    placeholder: { control: 'text', description: 'The placeholder while empty.' },
    onChange: { control: false },
  },
  args: { value: '', onChange: fn() },
} satisfies Meta<typeof CommentsField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Populated: Story = { args: { value: 'Explained the plan and confirmed the installation date.' } };

export const CustomWording: Story = { args: { label: 'Notes', helperText: 'Anything the next person should know.', placeholder: 'Add a note…' } };

export const TypeAComment: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <CommentsField {...args} value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox', { name: /comments/i });
    await userEvent.type(box, 'Asked for a paper copy');
    await expect(box).toHaveValue('Asked for a paper copy');
  },
};
