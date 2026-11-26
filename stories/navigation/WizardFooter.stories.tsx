import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { WizardFooter } from '../../src/components/primitives/WizardFooter';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Navigation/Wizard Footer',
  component: WizardFooter,
  parameters: {
    ...docsParameters({
      purpose: 'The action bar of a guided flow: Back at the left, the primary action at the right (Continue, or Save & Finish on the last step, or Submitting… while busy). A step can replace the primary action or add a control at the left.',
      source: 'src/components/primitives/WizardFooter.tsx',
      variants: ['In the page (default) or fixed to the bottom of the viewport (`fixedToViewport`).', 'First step: no Back.', 'Last step: Save & Finish.', 'Locked (`isLocked`): Back is removed.'],
      states: ['Continue disabled until `canProceed`.', 'Submitting.'],
      events: ['`goBack()`, `goNext()`; a step\'s `primaryAction` receives `goNext`, `abandon` and the default button.'],
    }),
  },
  argTypes: { goBack: { control: false }, goNext: { control: false }, setValue: { control: false }, onAbandonStep: { control: false }, currentStep: { control: false }, values: { control: false } },
  args: { currentStep: undefined, currentIndex: 1, stepCount: 4, values: {}, isLocked: false, canProceed: true, submitting: false, goBack: fn(), goNext: fn(async () => {}), setValue: fn(), onAbandonStep: fn() },
} satisfies Meta<typeof WizardFooter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: /Continue/ }));
    await expect(args.goNext).toHaveBeenCalled();
    await userEvent.click(c.getByRole('button', { name: /Back/ }));
    await expect(args.goBack).toHaveBeenCalled();
  },
};
export const FirstStep: Story = { args: { currentIndex: 0 } };
export const LastStep: Story = { args: { currentIndex: 3 } };
export const CannotProceed: Story = { args: { canProceed: false } };
export const Submitting: Story = { args: { submitting: true } };
export const Locked: Story = { args: { isLocked: true } };
