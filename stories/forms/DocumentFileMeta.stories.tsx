import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, waitFor } from 'storybook/test';
import { DocumentFileMeta } from '../../src/components/primitives/DocumentFileMeta';
import { pdfFile, pngFile } from '../_shared/fixtures';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Forms/Document File Meta',
  component: DocumentFileMeta,
  parameters: {
    ...docsParameters({
      purpose: 'The size of a chosen file in brackets - "(148 KB)" - with its page count - "(148 KB · 1 page)" - when it is a PDF whose pages can be counted. An image shows its size only.',
      source: 'src/components/primitives/DocumentFileMeta.tsx (formatting: src/lib/format.ts; page count: src/lib/pdfPageCount.ts)',
      states: ['Image: size only.', 'PDF: size, then the page count once read.'],
    }),
  },
  argTypes: { file: { control: false } },
} satisfies Meta<typeof DocumentFileMeta>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Image: Story = {
  args: { file: pngFile() },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/\(\d+ B\)/)).toBeVisible();
  },
};
export const Pdf: Story = {
  args: { file: pdfFile() },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByText(/1 page/)).toBeVisible());
  },
};
