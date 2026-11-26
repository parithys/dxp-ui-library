import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { CameraCaptureButton } from '../../src/components/primitives/CameraCaptureButton';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Forms/Camera Capture Button',
  component: CameraCaptureButton,
  parameters: {
    ...docsParameters({
      purpose: 'A tablet\'s way to capture a document in place of the desk scanner: `Open Camera` opens the rear camera and hands over the photo as one `File`, named like a scan.',
      source: 'src/components/primitives/CameraCaptureButton.tsx',
      variants: ['Default label `Open Camera`; `ariaLabel` names the document or side when the label alone does not.'],
      states: ['Idle', 'Disabled (with `title` as the tooltip)'],
      events: ['`onCapture(file)` - the photo, renamed `scan-{yyyyMMddHHmmss}-{document type}.{ext}`.'],
      usage: ['Not used on its own in a screen: Document Capture Actions and ID File Upload show it on a tablet, before Upload.', 'The caller checks the file (type, size) exactly as it checks an upload.'],
      accessibility: ['The camera input (`accept="image/*" capture="environment"`) is `aria-hidden` and out of the tab order; the button is the interface.'],
      devices: ['Shown only on a tablet / phone by its callers. A browser without a camera opens its file picker instead.'],
    }),
  },
  argTypes: {
    label: { control: 'text', description: 'The visible label.' },
    ariaLabel: { control: 'text', description: 'The accessible name, starting with the label.' },
    documentType: { control: 'text', description: 'Ends up in the captured file name.' },
    disabled: { control: 'boolean', description: 'Disables the button.' },
    title: { control: 'text', description: 'Tooltip when disabled.' },
    onCapture: { control: false },
  },
  args: { onCapture: fn(), documentType: 'Court Order' },
} satisfies Meta<typeof CameraCaptureButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Open Camera' })).toBeVisible();
    await expect(canvasElement.querySelector('input[type="file"]')).toHaveAttribute('capture', 'environment');
  },
};
export const NamedForASide: Story = { args: { ariaLabel: 'Open Camera for the front side', documentType: 'front side' } };
export const Disabled: Story = { args: { disabled: true, title: 'Choose a Document Type first' } };
