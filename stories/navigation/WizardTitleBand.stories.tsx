import { WizardTitleBand } from '../../src/components/primitives/WizardTitleBand';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Navigation/Wizard Title Band',
  component: WizardTitleBand,
  parameters: {
    ...docsParameters({
      purpose: 'The title row of a guided flow: the title with the draft and abandon actions at the right, an optional aside under the title, and a notice when a pop-up was blocked.',
      source: 'src/components/primitives/WizardTitleBand.tsx',
      variants: ['Title only.', 'With Save as Draft and Abandon Order (`onSaveExit` / `onAbandon` plus their request handlers).', 'With `popupBlocked`.'],
      events: ['`onRequestSaveExit` and `onRequestAbandon` when the buttons are pressed.'],
    }),
  },
  argTypes: { titleAside: { control: false }, titleAction: { control: false }, onSaveExit: { control: false }, onAbandon: { control: false }, onRequestSaveExit: { control: false }, onRequestAbandon: { control: false } },
  args: { title: 'New Order' },
} satisfies Meta<typeof WizardTitleBand>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithActions: Story = { args: { titleAside: 'Alex Morgan', onSaveExit: fn(), onAbandon: fn(), onRequestSaveExit: fn(), onRequestAbandon: fn() } };
export const PopupBlocked: Story = { args: { popupBlocked: true } };
