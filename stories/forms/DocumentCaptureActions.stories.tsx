import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { DocumentCaptureActions } from '../../src/components/primitives/DocumentCaptureActions';
import { docsParameters } from '../_shared/docs';
import { Column, SideBySide, Specimen } from '../_shared/layout';
import { chooseFile, jpgFile } from '../_shared/fixtures';

const meta = {
  title: 'Forms/Document Capture Actions',
  component: DocumentCaptureActions,
  parameters: {
    ...docsParameters({
      purpose: 'How a supporting document is taken, by device: the buttons that bring one `File` to the caller. Used by Supporting Document fields, Signed Documents (CAF), Additional Documents and every document scenario.',
      source: 'src/components/primitives/DocumentCaptureActions.tsx',
      variants: [
        '**Web**: `Initiate Scan` (the desk scanner) only.',
        '**Web with `uploadOnWeb`** (Additional Documents): `Upload Document` beside `Initiate Scan`.',
        '**Tablet / mobile**: `Open Camera` (the rear camera; the photo is handed over like a scan) and `Upload Document` - never `Initiate Scan`.',
      ],
      states: ['Idle', 'Scanning (`Scanning…`, the scan button is disabled)', '`hasDocument`: the upload button reads `Replace Document` (the web scan button always reads `Initiate Scan`)', 'Disabled (with `disabledTitle` as the tooltip)', 'Scan failed (a `role="alert"` message beside the buttons)'],
      events: ['`onFile(file)` - the scanned file, or the uploaded one.', '`onUpload(file)` - where an uploaded file goes when that differs from a scanned one (defaults to `onFile`).'],
      usage: ['The caller checks the file against the shared upload rules (type, size); this control only says where the file comes from.', 'A scan is the demo desk scanner (`lib/documentScan.ts`): one A4 JPEG named `scan-{yyyyMMddHHmmss}-{document type}.jpg`.'],
      accessibility: ['The upload input is visually hidden with `aria-label="Choose the {what}"`; the button opens it.', 'A scan failure is announced (`role="alert"`).'],
      devices: ['Pass `device` to force an experience (stories below do); otherwise the app detects it once per page (`lib/deviceType.ts`) - use the toolbar Device switch or `?device=tablet`.'],
    }),
  },
  argTypes: {
    device: { control: 'select', options: ['web', 'tablet'], description: 'Forces Web or Tablet; omitted, the detected device is used.' },
    uploadOnWeb: { control: 'boolean', description: 'The web offers Upload Document beside Initiate Scan.' },
    hasDocument: { control: 'boolean', description: 'A document is already attached: the upload button reads Replace Document.' },
    disabled: { control: 'boolean', description: 'Disables the controls.' },
    disabledTitle: { control: 'text', description: 'Tooltip explaining why they are disabled.' },
    what: { control: 'text', description: 'Names the document in the accessible name of the file input.' },
    documentType: { control: 'text', description: 'The document type as the screen names it; ends up in a scanned file name.' },
    accept: { control: 'text', description: 'The input `accept` attribute (default PDF, JPG).' },
    onFile: { control: false },
    onUpload: { control: false },
  },
  args: { onFile: fn(), what: 'supporting document', documentType: 'Passport', device: 'web' },
  decorators: [(Story) => <div className="cluster"><Story /></div>],
} satisfies Meta<typeof DocumentCaptureActions>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Web: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'Upload Document' })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Initiate Scan' }));
    await expect(canvas.getByRole('button', { name: 'Scanning…' })).toBeDisabled();
    await waitFor(() => expect(args.onFile).toHaveBeenCalledTimes(1));
    const file = (args.onFile as ReturnType<typeof fn>).mock.calls[0][0] as File;
    await expect(file.name).toMatch(/^scan-\d{14}-passport\.jpg$/);
  },
};

export const WebWithUpload: Story = {
  args: { uploadOnWeb: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Upload Document' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Initiate Scan' })).toBeVisible();
    await chooseFile(canvasElement, jpgFile('passport.jpg'), /Choose the supporting document/);
    await expect(args.onFile).toHaveBeenCalledTimes(1);
  },
};

export const Tablet: Story = {
  args: { device: 'tablet' },
  tags: ['tablet'], globals: { device: 'tablet' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'Initiate Scan' })).toBeNull();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Open Camera to capture the supporting document' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Upload Document' })).toHaveFocus();
    await chooseFile(canvasElement, jpgFile('passport.jpg'), /Choose the supporting document/);
    await expect(args.onFile).toHaveBeenCalledWith(expect.objectContaining({ name: 'passport.jpg' }));
  },
};

export const ReplaceDocument: Story = {
  args: { device: 'tablet', hasDocument: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Replace Document' })).toBeVisible();
  },
};

export const WebReplaceDocument: Story = {
  args: { hasDocument: true, uploadOnWeb: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Replace Document' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Initiate Scan' })).toBeVisible();
  },
};

export const Disabled: Story = {
  args: { uploadOnWeb: true, disabled: true, disabledTitle: 'Choose a Document Type first' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Initiate Scan' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Upload Document' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Upload Document' })).toHaveAttribute('title', 'Choose a Document Type first');
  },
};

export const WebAndTablet: Story = {
  render: (args) => (
    <SideBySide>
      <Specimen label="Web (device = web)">
        <div className="cluster">
          <DocumentCaptureActions {...args} device="web" />
        </div>
      </Specimen>
      <Specimen label="Tablet (device = tablet)">
        <div className="cluster">
          <DocumentCaptureActions {...args} device="tablet" />
        </div>
      </Specimen>
    </SideBySide>
  ),
};

export const AllStates: Story = {
  render: (args) => (
    <Column>
      <Specimen label="Web: scan only">
        <div className="cluster"><DocumentCaptureActions {...args} device="web" /></div>
      </Specimen>
      <Specimen label="Web with uploadOnWeb: scan and upload">
        <div className="cluster"><DocumentCaptureActions {...args} device="web" uploadOnWeb /></div>
      </Specimen>
      <Specimen label="Tablet: camera and upload">
        <div className="cluster"><DocumentCaptureActions {...args} device="tablet" /></div>
      </Specimen>
      <Specimen label="Tablet with a document: Replace Document">
        <div className="cluster"><DocumentCaptureActions {...args} device="tablet" hasDocument /></div>
      </Specimen>
      <Specimen label="Disabled (type not chosen yet)">
        <div className="cluster"><DocumentCaptureActions {...args} device="web" uploadOnWeb disabled disabledTitle="Choose a Document Type first" /></div>
      </Specimen>
    </Column>
  ),
};
