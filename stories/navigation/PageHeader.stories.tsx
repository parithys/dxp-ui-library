import { PageHeader } from '../../src/components/primitives/PageHeader';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { docsParameters } from '../_shared/docs';
import { Button } from '../../src/components/ui/button';

const meta = {
  title: 'Navigation/Page Header',
  component: PageHeader,
  parameters: {
    ...docsParameters({
      purpose: 'The page header every screen uses: a full-bleed dark band with a bold title and an optional description. Badges sit beside the title; actions sit at the right, centred against the whole header.',
      source: 'src/components/primitives/PageHeader.tsx',
      variants: ['Title only.', 'With description, badges and actions.', '`bleed={false}` where the header is not the first thing inside a padded page.', '`level={2}` where the page already has its h1.'],
      accessibility: ['Renders a `header` with the title as `h1` (or `h2` with `level={2}`).'],
    }),
  },
  argTypes: {
    title: { control: 'text', description: 'The page title.' },
    description: { control: 'text', description: 'A line under the title.' },
    bleed: { control: 'boolean', description: 'Pulls the band out to the page edges by cancelling the page wrapper padding.' },
    level: { control: 'select', options: [1, 2], description: 'Heading level of the title.' },
    badges: { control: false },
    actions: { control: false },
  },
  args: { title: 'Orders', bleed: false },
} satisfies Meta<typeof PageHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescriptionAndActions: Story = {
  args: { description: 'Everything placed this week.', actions: <Button variant="secondary" size="sm">Export</Button> },
};
export const SecondLevel: Story = { args: { level: 2 } };
