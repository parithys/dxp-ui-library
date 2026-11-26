import { CustomerViewButton } from '../../src/components/primitives/CustomerViewButton';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Navigation/Customer View Button',
  component: CustomerViewButton,
  parameters: {
    ...docsParameters({
      purpose: 'The toggle that shares a screen section with the person across the counter: a button that, while sharing, reads "Showing to customer" and carries a "Visible to customer" tag with a pulsing dot.',
      source: 'src/components/primitives/CustomerViewButton.tsx',
      states: ['Not sharing (`viewOpen` false).', 'Sharing (`viewOpen` true): the tag and the pulsing dot show.'],
      events: ['`onToggle()` on click.'],
      accessibility: ['The tooltip states what the toggle does in each state.'],
    }),
  },
  argTypes: { viewOpen: { control: 'boolean', description: 'Whether the section is being shared.' }, onToggle: { control: false } },
  args: { viewOpen: false, onToggle: fn() },
} satisfies Meta<typeof CustomerViewButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Sharing: Story = { args: { viewOpen: true } };
