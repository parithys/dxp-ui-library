import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { FileImagePreview, FilePagesPreview } from '../../src/components/primitives/FileImagePreview';
import { docsParameters } from '../_shared/docs';
import { Column, Specimen } from '../_shared/layout';
import { pdfFile, pngFile } from '../_shared/fixtures';

const meta = {
  title: 'Forms/File Image Preview',
  component: FileImagePreview,
  parameters: {
    ...docsParameters({
      purpose: 'The picture in an image file the agent has just scanned, photographed or chosen, shown before it is attached. Also `FilePagesPreview`: the pages of a multi-page scan side by side.',
      source: 'src/components/primitives/FileImagePreview.tsx',
      variants: ['`FileImagePreview` - one image with a caption (the file name, or `caption`).', '`FilePagesPreview` - every page captioned `Page n of N`; with `onDelete`, each page has a `Delete Page` button.'],
      states: ['Image file: preview drawn.', 'Not an image (a PDF), no file or unread file: renders nothing - the name and size line of the caller says what it is.'],
      events: ['`onDelete(index)` (pages preview) - the page to delete.'],
      accessibility: ['The image has `alt="Preview of {file name}"`; each Delete Page button names its page.'],
    }),
  },
  argTypes: { file: { control: false, description: 'The file to preview (a File object, so no control).' }, caption: { control: 'text', description: 'Caption under the image; defaults to the file name.' } },
  args: { file: pngFile('scan-front.png') },
} satisfies Meta<typeof FileImagePreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByRole('img', { name: 'Preview of scan-front.png' })).toBeVisible());
    await expect(within(canvasElement).getByText('scan-front.png')).toBeVisible();
  },
};
export const WithCaption: Story = { args: { caption: 'Passport data page' } };
export const NotAnImage: Story = {
  args: { file: pdfFile('letter.pdf') },
  parameters: { docs: { description: { story: 'A PDF shows nothing here: nothing is drawn and the caller\'s file name and size line says what was chosen.' } } },
  play: async ({ canvasElement }) => {
    await new Promise((r) => setTimeout(r, 200));
    await expect(within(canvasElement).queryByRole('img')).toBeNull();
  },
};
export const NoFile: Story = { args: { file: undefined } };

export const Pages: Story = {
  render: () => (
    <Column>
      <Specimen label="FilePagesPreview (read-only)">
        <FilePagesPreview files={[pngFile('page-1.png'), pngFile('page-2.png')]} />
      </Specimen>
    </Column>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByText('Page 2 of 2')).toBeVisible());
  },
};

export const PagesWithDelete: Story = {
  args: { file: undefined },
  render: () => {
    const onDelete = fn();
    return <FilePagesPreview files={[pngFile('page-1.png'), pngFile('page-2.png')]} onDelete={onDelete} />;
  },
  play: async ({ canvasElement }) => {
    const del = await within(canvasElement).findByRole('button', { name: 'Delete page 2' });
    await userEvent.click(del);
  },
};
