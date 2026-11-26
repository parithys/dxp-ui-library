import type { Meta, StoryObj } from '@storybook/react-vite';
import { StarStat } from '../../src/components/primitives/StarStat';
import { docsParameters } from '../_shared/docs';
import { Row, Specimen } from '../_shared/layout';

const meta = {
  title: 'Primitives/Star Stat',
  component: StarStat,
  parameters: {
    ...docsParameters({
      purpose: 'One fact on a Star-number card: a muted label over a bold value (Price, Lock-In Period, Amount to Pay, Blocked By ...). Used only inside the number picker\'s cards.',
      source: 'src/components/primitives/StarStat.tsx',
      variants: ['Default: muted label, bold value.', '`alert`: the red upfront charge (Amount to Pay), label and value both accent.', '`plainValue`: a regular-weight value.'],
      accessibility: ['Plain paragraphs: the label and value are read in order inside the card, which is itself the button.'],
    }),
  },
  argTypes: {
    label: { control: 'text', description: 'The fact\'s name.' },
    value: { control: 'text', description: 'The value; use non-breaking spaces to keep "$8,750" together.' },
    alert: { control: 'boolean', description: 'The red upfront charge.' },
    plainValue: { control: 'boolean', description: 'Regular-weight value.' },
  },
  args: { label: 'Price', value: 'QAR 5,000' },
} satisfies Meta<typeof StarStat>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Alert: Story = { args: { label: 'Amount to Pay', value: 'QAR 2,500', alert: true } };

export const PlainValue: Story = { args: { label: 'Blocked Reason', value: 'Reserved for Villaggio Mall Branch', plainValue: true } };

export const AllVariants: Story = {
  render: () => (
    <Row>
      <Specimen label="Default">
        <StarStat label="Lock-In Period" value={'24 months'} />
      </Specimen>
      <Specimen label="Alert">
        <StarStat label="Amount to Pay" value={'QAR 2,500'} alert />
      </Specimen>
      <Specimen label="Plain value">
        <StarStat label="Blocked By" value="Retail Sales" plainValue />
      </Specimen>
    </Row>
  ),
};
