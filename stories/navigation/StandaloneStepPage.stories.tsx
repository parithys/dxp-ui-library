import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { StandaloneStepPage } from '../../src/components/primitives/StandaloneStepPage';
import type { WizardStep } from '../../src/lib/wizardTypes';
import { Input } from '../../src/components/primitives/Input';
import { docsParameters } from '../_shared/docs';

const STEP: WizardStep = { key: 'portal', label: 'Number Portal', heading: 'Number Management Portal', subheading: 'Search, reserve and release numbers.', render: () => null };

const meta = {
  title: 'Navigation/Standalone Step Page',
  component: StandaloneStepPage,
  parameters: {
    layout: 'fullscreen',
    ...docsParameters({
      purpose: 'A guided-journey step\'s page for a screen that is not itself a wizard (the Number Management Portal): the same title band, step card with its heading and header action, and fixed action bar as the Guided Activation Wizard, built from the same parts. The screen says what is on the page; none of the layout, spacing or button placement is its own.',
      source: 'src/components/primitives/StandaloneStepPage.tsx',
      variants: ['`description`: a line under the title in the band.', '`titleActions.onAbandon`: Abandon Order in the band (and nothing else - no Save as Draft).', '`onNext`: shows the footer\'s primary Continue (with the chevron), enabled by `canProceed`; without it there is no footer.', '`step`: supplies the heading (`heading`, else `label`), subheading and optional `headerAction`.'],
      states: ['Without footer', 'Continue enabled / disabled (`canProceed`)'],
      events: ['`onNext()` from Continue; `titleActions.onAbandon()` from Abandon Order.'],
      accessibility: ['The title band holds the page `h1`; the step\'s heading is an `h2`. The footer is fixed to the viewport, so the step card leaves room (`pb-24`) beneath its content.'],
      restrictions: ['Never shows Customer view or Back: the page has no previous step. The footer is `fixedToViewport`, so in the docs page the bar is fixed to the preview frame.'],
    }),
  },
  argTypes: {
    title: { control: 'text', description: 'The page title in the band.' },
    description: { control: 'text', description: 'A line under the title.' },
    canProceed: { control: 'boolean', description: 'Continue is enabled.' },
    step: { control: false },
    titleActions: { control: false },
    onNext: { control: false },
    children: { control: false },
  },
  args: { title: 'Number Management Portal', description: 'Manage the number inventory', step: STEP, children: <Input label="Search numbers" placeholder="Enter a number" /> },
} satisfies Meta<typeof StandaloneStepPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1, name: 'Number Management Portal' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: /Continue/ })).toBeNull();
  },
};

export const WithContinue: Story = {
  args: { onNext: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Continue/ }));
    await expect(args.onNext).toHaveBeenCalledTimes(1);
  },
};

export const ContinueDisabled: Story = {
  args: { onNext: fn(), canProceed: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: /Continue/ })).toBeDisabled();
  },
};

export const WithAbandonOrder: Story = {
  args: { onNext: fn(), titleActions: { onAbandon: fn() } },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Abandon Order' }));
    await expect(args.titleActions?.onAbandon).toHaveBeenCalledTimes(1);
  },
};
