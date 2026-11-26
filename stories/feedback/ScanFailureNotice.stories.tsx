import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ScanFailureNotice } from '../../src/components/primitives/ScanFailureNotice';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Feedback & Status/Scan Failure Notice',
  component: ScanFailureNotice,
  parameters: {
    ...docsParameters({
      purpose: 'A scan that could not be completed, laid out as what happened, what to do next and any condition that applies - instead of one bulleted list of red text.',
      source: 'src/components/primitives/ScanFailureNotice.tsx',
      variants: ['One line: a plain message.', 'Two lines: what happened, then what to do.', 'Three or more lines: what happened, what to do (the lines between), and the condition (the last line, shown as a footer).'],
      usage: ['The wording is the caller\'s. The ID scanner shows it once the permitted scan attempts are used up.'],
      accessibility: ['`role="alert"`: the failure is announced - the agent\'s attention is on the physical reader, not the screen.'],
    }),
  },
  argTypes: { lines: { control: 'object', description: 'First line = what happened; last line (three or more lines) = the condition; lines between = what to do.' } },
  args: {
    lines: [
      'We could not read the document after the permitted attempts.',
      'Select the ID type and enter the number manually to continue.',
      'Entering the number manually needs Store Manager approval.',
    ],
  },
} satisfies Meta<typeof ScanFailureNotice>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole('alert');
    await expect(alert).toHaveTextContent('We could not read the document');
    await expect(alert).toHaveTextContent('Store Manager approval');
  },
};
export const OneLine: Story = { args: { lines: ['The scan failed. Try again.'] } };
export const TwoLines: Story = { args: { lines: ['The image is unclear.', 'Place the document flat on the glass and scan again.'] } };
