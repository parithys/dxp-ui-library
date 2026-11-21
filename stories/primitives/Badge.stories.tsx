import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, type BadgeVariant } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Row, Specimen } from '../_shared/layout';

const VARIANTS: BadgeVariant[] = ['outlined-red', 'filled-neutral', 'success', 'success-solid', 'warning', 'danger', 'danger-solid', 'info', 'accent', 'tag-blue', 'tag-amber', 'tag-green', 'tag-violet', 'tag-red', 'tag-primary'];

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  parameters: {
    ...docsParameters({
      purpose: 'Pill-shaped status and category label: outlined tinted pills for status, solid fills for emphasis, `tag-*` colours for categories. Each variant is a semantic class (`.badge-*`) in ui-components.css.',
      source: 'src/components/primitives/Badge.tsx',
      variants: [`Badge variants: ${VARIANTS.map((v) => `\`${v}\``).join(', ')}.`],
      states: ['Static label; no hover or selection state.'],
      usage: ['Use Service Type Tag / Connection Type Tag for service kinds, never a hand-coloured pill. Wrapped in a Tooltip, a Badge becomes focusable.'],
      accessibility: ['The label carries the meaning; colour is never the only cue. It takes span props and ref, so a Tooltip can wrap it.'],
    }),
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS, description: 'Colour variant.' },
    children: { control: 'text', description: 'Label.' },
  },
  args: { children: 'Active' },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Success: Story = { args: { variant: 'success', children: 'Completed' } };
export const Warning: Story = { args: { variant: 'warning', children: 'Pending' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Blacklisted' } };
export const Info: Story = { args: { variant: 'info', children: 'Requires approval' } };
export const SolidFills: Story = { render: () => <Row><Badge variant="success-solid">Verified</Badge><Badge variant="danger-solid">Blocked</Badge></Row> };

export const AllVariants: Story = {
  render: () => (
    <Row>
      {VARIANTS.map((v) => (
        <Specimen key={v} label={v}><Badge variant={v}>{v}</Badge></Specimen>
      ))}
    </Row>
  ),
};

