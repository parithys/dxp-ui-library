import { useState } from 'react';
import { StepSummarySection } from '../../src/components/primitives/StepSummarySection';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Navigation/Step Summary Section',
  component: StepSummarySection,
  parameters: {
    ...docsParameters({
      purpose: 'One step in a running summary of a guided flow: a collapsible block titled with the step, an Edit action that goes back to it, and a status disc (tick, flag for a milestone, empty for a step reached earlier).',
      source: 'src/components/primitives/StepSummarySection.tsx',
      variants: ['Completed (collapsible, with Edit).', '`milestone`: a flag in place of the tick.', '`current`: the page being worked on, a tinted band with no details.', '`onGo`: a step reached earlier but not on screen, as a link.'],
      events: ['`onToggle`, `onEdit`, `onGo`.'],
    }),
  },
  argTypes: { open: { control: 'boolean' }, milestone: { control: 'boolean' }, current: { control: 'boolean' }, onToggle: { control: false }, onEdit: { control: false }, onGo: { control: false }, icon: { control: false }, children: { control: false } },
  args: { title: 'Contact', open: true, onToggle: fn(), onEdit: fn(), children: <p className="body-text">Alex Morgan</p> },
} satisfies Meta<typeof StepSummarySection>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Collapsed: Story = { args: { open: false } };
export const Milestone: Story = { args: { milestone: true } };
export const Current: Story = { args: { current: true } };
export const ReachedEarlier: Story = { args: { onGo: fn() } };
export const Interactive: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return <StepSummarySection {...args} open={open} onToggle={() => setOpen((o) => !o)} />;
  },
};
