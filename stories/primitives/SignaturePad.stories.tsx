import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { SignaturePad } from '../../src';
import { docsParameters } from '../_shared/docs';
import { SideBySide, Specimen } from '../_shared/layout';

const meta = {
  title: 'Forms/Signature Pad',
  component: SignaturePad,
  parameters: {
    ...docsParameters({
      purpose: 'The drawn-signature capture used by the CAF / contract "Please Sign" pad: a 480 x 160 canvas, Clear and Done buttons, optional Cancel. PROTECTED - no shadcn primitive replaces it.',
      source: 'src/components/primitives/SignaturePad.tsx',
      states: ['Empty (Clear and Done disabled)', 'Signed (Clear and Done enabled)', 'Disabled (canvas dimmed, not drawable, buttons disabled)'],
      events: ['onDone(dataUrl) - the canvas as a PNG data URL (transparent background).', 'onCancel() - when given, a Cancel button is shown.'],
      usage: [
        '`doneLabel` (default "Done") and `clearLabel` (default "Clear") rename the buttons.',
        'To discard a drawing when disabling, remount the pad with a new `key`.',
        'The ink colour is read from the --signature-ink token and does not follow the dark theme: the PNG is placed on a white form.',
      ],
      accessibility: [
        'The canvas is pointer-only: it has no role, name, keyboard alternative or text alternative, and a disabled pad is marked aria-disabled. Clear and Done are real buttons. See Restrictions.',
      ],
      restrictions: ['Defect noted for the owner: a signature cannot be drawn by keyboard or assistive technology and the canvas has no accessible name; the canvas is a fixed 480px wide intrinsic size, so narrow screens rely on CSS to scale it.'],
    }),
  },
  argTypes: {
    doneLabel: { control: 'text', description: 'Label of the confirm button.' },
    clearLabel: { control: 'text', description: 'Label of the clear button.' },
    disabled: { control: 'boolean', description: 'Dim the canvas and disable drawing and buttons.' },
    onDone: { action: 'done' },
    onCancel: { action: 'cancelled', description: 'When given, shows a Cancel button.' },
  },
  args: { onDone: fn() },
} satisfies Meta<typeof SignaturePad>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Draws a stroke with real pointer events on the canvas. */
async function draw(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const at = (dx: number, dy: number) => ({ clientX: rect.left + dx, clientY: rect.top + dy, pointerId: 1, bubbles: true });
  canvas.dispatchEvent(new PointerEvent('pointerdown', at(20, 80)));
  canvas.dispatchEvent(new PointerEvent('pointermove', at(80, 40)));
  canvas.dispatchEvent(new PointerEvent('pointermove', at(140, 110)));
  canvas.dispatchEvent(new PointerEvent('pointermove', at(220, 60)));
  canvas.dispatchEvent(new PointerEvent('pointerup', at(220, 60)));
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'Clear' })).toBeDisabled();
    await expect(c.getByRole('button', { name: 'Done' })).toBeDisabled();
  },
};

export const DrawClearAndDone: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await draw(canvasElement.querySelector('canvas') as HTMLCanvasElement);
    await waitFor(() => expect(c.getByRole('button', { name: 'Done' })).toBeEnabled());
    await userEvent.click(c.getByRole('button', { name: 'Done' }));
    await expect(args.onDone).toHaveBeenCalled();
    await userEvent.click(c.getByRole('button', { name: 'Clear' }));
    await waitFor(() => expect(c.getByRole('button', { name: 'Done' })).toBeDisabled());
  },
};

export const Signed: Story = {
  play: async ({ canvasElement }) => {
    await draw(canvasElement.querySelector('canvas') as HTMLCanvasElement);
    await waitFor(() => expect(within(canvasElement).getByRole('button', { name: 'Clear' })).toBeEnabled());
  },
};

export const WithCancel: Story = {
  args: { onCancel: fn(), doneLabel: 'Save', clearLabel: 'Reset' },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Cancel' }));
    await expect(args.onCancel).toHaveBeenCalled();
    await expect(c.getByRole('button', { name: 'Save' })).toBeDisabled();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const canvas = canvasElement.querySelector('canvas') as HTMLCanvasElement;
    await expect(canvas).toHaveAttribute('aria-disabled', 'true');
    await draw(canvas);
    await expect(c.getByRole('button', { name: 'Done' })).toBeDisabled();
  },
};

export const EmptyVsDisabled: Story = {
  render: (args) => (
    <SideBySide>
      <Specimen label="Empty"><SignaturePad {...args} /></Specimen>
      <Specimen label="Disabled"><SignaturePad {...args} disabled /></Specimen>
    </SideBySide>
  ),
};
