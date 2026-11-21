import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, Icon, CHEVRON_LEFT, CHEVRON_RIGHT, DOWNLOAD_ICON, PLUS_ICON } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Column, Row, Specimen } from '../_shared/layout';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  parameters: {
    ...docsParameters({
      purpose: 'The application button: the shadcn/ui Button themed to the app\'s semantic classes (`.btn .btn-primary .btn-md`). Every clickable action in a journey, dialog or footer is one.',
      source: 'src/components/ui/button.tsx',
      variants: [
        '`default` - the red primary action.',
        '`secondary` (and its alias `outline`) - the bordered Back / Cancel button.',
        '`destructive` - irreversible actions.',
        '`tertiary` - a text link styled button; takes no size.',
        '`link` - the app\'s `.link` text link on a button; takes no size.',
        '`ghost` - borderless, fill-less; its look comes from the size. With `size="icon"` / `"icon-sm"` it is the app\'s icon button.',
        'Sizes: `sm`, `md` (= `default`), `lg`, `icon` (36px), `icon-sm` (28px).',
      ],
      states: ['Idle, hover, focus-visible (teal ring), pressed, disabled (native `disabled`).', 'There is no built-in loading state; screens swap the label (for example "Submitting…") and set `disabled`.'],
      events: ['`onClick` - native; never fires while `disabled`.'],
      usage: ['One primary (`default`) button per view; Back / Cancel are `secondary`. Put an `<Icon>` as a child before or after the label (the Button does not size icons). Content width by default; add `w-full` through `className` for full width.', '`type` defaults to `"button"`, so a Button inside a form does not submit it.'],
      accessibility: ['Icon sizes REQUIRE `aria-label` or `aria-labelledby` (the type enforces it).', 'Enter and Space activate it (native button).'],
      devices: ['Control heights come from `--control-h-sm/md/lg`; tablet.css scales them, so use the toolbar Device switch to compare Web and Tablet.'],
    }),
  },
  argTypes: {
    variant: { control: 'select', options: ['default', 'secondary', 'outline', 'destructive', 'tertiary', 'link', 'ghost'], description: 'Visual variant.' },
    size: { control: 'select', options: ['sm', 'md', 'default', 'lg'], description: 'Box size (icon sizes are shown in the Icon button stories).' },
    disabled: { control: 'boolean', description: 'Native disabled.' },
    children: { control: 'text', description: 'Label.' },
    className: { control: 'text', description: 'Extra classes, e.g. `w-full`.' },
    onClick: { control: false },
  },
  args: { children: 'Continue', onClick: fn() },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Continue' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};
export const Secondary: Story = { args: { variant: 'secondary', children: 'Back' } };
export const Outline: Story = { args: { variant: 'outline', children: 'Cancel' } };
export const Destructive: Story = { args: { variant: 'destructive', children: 'Remove line' } };
export const Tertiary: Story = { args: { variant: 'tertiary', children: 'Show all' } };
export const LinkVariant: Story = { name: 'Link', args: { variant: 'link', children: 'View details' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Ghost' } };
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };

export const WithIconBefore: Story = {
  render: (args) => (
    <Button {...args} variant="secondary">
      <Icon path={CHEVRON_LEFT} className="size-4" />
      Back
    </Button>
  ),
};
export const WithIconAfter: Story = {
  render: (args) => (
    <Button {...args}>
      Continue
      <Icon path={CHEVRON_RIGHT} className="size-4" />
    </Button>
  ),
};
export const FullWidth: Story = { args: { className: 'w-full' }, parameters: { layout: 'padded' }, decorators: [(Story) => <div style={{ maxWidth: 420 }}><Story /></div>] };

export const Hover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));
  },
};
export const Focus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button')).toHaveFocus();
  },
};
export const Pressed: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    await userEvent.pointer({ keys: '[MouseLeft>]', target: button });
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const BusyLabel: Story = {
  name: 'Loading (label swap)',
  args: { disabled: true, children: 'Submitting…' },
  parameters: { docs: { description: { story: 'The Button has no spinner prop; the wizard footer shows "Submitting…" and disables it.' } } },
};

export const IconButtons: Story = {
  parameters: { docs: { description: { story: '`size="icon"` (36px) and `"icon-sm"` (28px) with `variant="ghost"`; `aria-label` is required. For the labelled wrapper see Primitives/Icon Button.' } } },
  render: () => (
    <Row>
      <Button variant="ghost" size="icon" aria-label="Add"><Icon path={PLUS_ICON} className="size-4" /></Button>
      <Button variant="ghost" size="icon-sm" aria-label="Download"><Icon path={DOWNLOAD_ICON} className="size-3.5" /></Button>
      <Button variant="ghost" size="icon" aria-label="Add (disabled)" disabled><Icon path={PLUS_ICON} className="size-4" /></Button>
    </Row>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Add' })).toBeVisible();
  },
};

export const AllVariants: Story = {
  render: () => (
    <Column>
      <Specimen label="Variants">
        <Row>
          {(['default', 'secondary', 'outline', 'destructive', 'tertiary', 'link', 'ghost'] as const).map((v) => (
            <Button key={v} variant={v}>{v}</Button>
          ))}
        </Row>
      </Specimen>
      <Specimen label="Sizes (sm, md, lg)">
        <Row>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Row>
      </Specimen>
      <Specimen label="Disabled">
        <Row>
          <Button disabled>Primary</Button>
          <Button variant="secondary" disabled>Secondary</Button>
          <Button variant="destructive" disabled>Destructive</Button>
        </Row>
      </Specimen>
    </Column>
  ),
};

export const WizardFooterBar: Story = {
  name: 'Button bar (wizard footer)',
  parameters: { docs: { description: { story: 'The bar the guided wizard draws (`WizardFooter`, src/components/patterns/wizard/WizardFooter.tsx): Back (secondary, chevron before) on the left, Continue (default, chevron after) on the right, `row-between`. The real WizardFooter needs wizard step state, so it is shown in Patterns; this is the same markup with the same Button. `.action-bar` pins it to the viewport bottom in journeys.' } } },
  render: () => (
    <div className="row-between w-full">
      <Button variant="secondary"><Icon path={CHEVRON_LEFT} className="size-4" />Back</Button>
      <Button>Continue<Icon path={CHEVRON_RIGHT} className="size-4" /></Button>
    </div>
  ),
};
