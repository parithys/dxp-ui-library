import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { SignatureCapture } from '../../src/components/primitives/SignatureCapture';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Forms/Signature Capture',
  component: SignatureCapture,
  parameters: {
    ...docsParameters({
      purpose: 'The standard signature control for any flow that captures a signature: a static "Please Sign" label and the signing canvas always on screen below it, with Clear and Save. Save hands the signature (a PNG data URL) to `onSave`.',
      source: 'src/components/primitives/SignatureCapture.tsx (canvas: src/components/primitives/SignaturePad.tsx, protected)',
      states: ['Enabled, nothing drawn: Clear and Save are disabled.', 'Drawn: Clear and Save enabled.', 'Disabled: the pad is not drawable until a precondition (e.g. agreeing to the terms) is met; going back to disabled discards anything drawn (the pad remounts).'],
      events: ['`onSave(dataUrl)` - the signature as a PNG data URL.'],
      usage: ['`doneLabel` / `clearLabel` carry the signer\'s language on the signing screen.', 'It does not lock itself: the host replaces it with the saved signature.'],
      accessibility: ['The disabled pad is `aria-disabled`. Drawing is by pointer (mouse, finger or stylus); there is no keyboard way to sign.'],
      restrictions: ['The canvas has no keyboard or screen-reader alternative: signing needs a pointer.'],
      devices: ['A finger on a tablet or a mouse on the web draw the same pad.'],
    }),
  },
  argTypes: {
    label: { control: 'text', description: 'The caption above the pad (default "Please Sign").' },
    doneLabel: { control: 'text', description: 'The Save button\'s word.' },
    clearLabel: { control: 'text', description: 'The Clear button\'s word.' },
    disabled: { control: 'boolean', description: 'Keeps the pad disabled until a precondition is met.' },
    onSave: { control: false },
  },
  args: { onSave: fn() },
  decorators: [(Story) => <div style={{ maxWidth: 520 }}><Story /></div>],
} satisfies Meta<typeof SignatureCapture>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Please Sign')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Clear' })).toBeDisabled();
  },
};

export const DrawAndSave: Story = {
  name: 'Draw, Clear and Save (interactive)',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const pad = canvasElement.querySelector('canvas') as HTMLCanvasElement;
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: pad, coords: { clientX: 40, clientY: 40 } },
      { target: pad, coords: { clientX: 120, clientY: 90 } },
      { target: pad, coords: { clientX: 200, clientY: 50 } },
      { keys: '[/MouseLeft]', target: pad },
    ]);
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Save' })).toBeEnabled());
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeDisabled();
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: pad, coords: { clientX: 40, clientY: 40 } },
      { target: pad, coords: { clientX: 160, clientY: 100 } },
      { keys: '[/MouseLeft]', target: pad },
    ]);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(args.onSave).toHaveBeenCalledWith(expect.stringMatching(/^data:image\/png/));
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('canvas')).toHaveAttribute('aria-disabled', 'true');
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeDisabled();
  },
};

export const ArabicLabels: Story = {
  args: { label: 'يرجى التوقيع', doneLabel: 'حفظ', clearLabel: 'مسح' },
  parameters: { docs: { description: { story: 'On a signing screen the labels follow the signer\'s language.' } } },
};
