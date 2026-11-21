import { useState } from 'react';
import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SearchField } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Row, Specimen } from '../_shared/layout';

type SearchArgs = ComponentProps<typeof SearchField>;

const CUSTOMERS = ['Aisha Al Thani', 'Omar Khalid', 'Fatima Al Kuwari', 'Hassan Al Marri', 'Mariam Al Naimi', 'Omar Al Sulaiti'];

/** A search box over a list: the field owns the text, the list narrows as you type, the clear button empties it. */
function SearchDemo(args: SearchArgs) {
  const [query, setQuery] = useState('');
  const hits = CUSTOMERS.filter((n) => n.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="stack gap-3" style={{ maxWidth: 380 }}>
      <label htmlFor="sf-demo" className="text-[length:var(--fs-label)] text-fg">Find a customer</label>
      <SearchField {...args} id="sf-demo" value={query} placeholder="Name" onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery('')} />
      <ul aria-label="Results" className="stack gap-1">
        {hits.map((n) => <li key={n} className="body-text">{n}</li>)}
      </ul>
      {hits.length === 0 && <p role="status" className="caption-muted">No customers found.</p>}
    </div>
  );
}

const meta = {
  title: 'Forms/Search Field',
  component: SearchField,
  parameters: {
    ...docsParameters({
      purpose: 'The one search / lookup text field: a leading search icon, rounded border that darkens once it has text, and a clear button. The field only holds text - filtering is done by the owner (the demo filters a list).',
      source: 'src/components/primitives/SearchField.tsx',
      variants: ['With the search icon (default)', '`hideIcon`: no leading icon - for dropdown-like fields (company, Kahramaa ID) that reuse its chrome', 'Children: anything hanging off the wrapper, such as a results list (see CompanySearchInput)'],
      states: ['Empty', 'Populated (clear button visible)', 'Focus', 'Disabled (icon greyed, no clear button)'],
      events: ['onChange: native input event. onClear(): called by the clear (x) button, which shows only while there is text and the field is enabled.'],
      usage: [
        'There is no loading state and no built-in filtering. Pass `value` for the border to follow filled state.',
        'A real search box keeps its `placeholder`; a field with role="combobox" drops it.',
        'Pair with a visible label or aria-label - the component renders none.',
      ],
      accessibility: ['The clear button is labelled "Clear search". The icon is decorative. The input is a plain type="text": add aria-label or a <label htmlFor>.'],
      devices: ['Control height and padding follow the --control-h tokens (Web / Tablet).'],
    }),
  },
  argTypes: {
    hideIcon: { control: 'boolean', description: 'Leave out the leading search icon.' },
    disabled: { control: 'boolean', description: 'Unavailable.' },
    placeholder: { control: 'text', description: 'Hint inside the field.' },
    onClear: { action: 'cleared', description: 'Shows the clear button while there is text.' },
    wrapperClassName: { control: 'text', description: 'Classes for the wrapper (width, margin).' },
    value: { control: false },
  },
  args: { onClear: fn() },
  render: (args) => <SearchDemo {...args} />,
} satisfies Meta<typeof SearchField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filtering: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByLabelText('Find a customer'), 'omar');
    await expect(within(c.getByRole('list', { name: 'Results' })).getAllByRole('listitem')).toHaveLength(2);
  },
};

export const ClearButton: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const field = c.getByLabelText('Find a customer');
    await expect(c.queryByRole('button', { name: 'Clear search' })).toBeNull();
    await userEvent.type(field, 'fat');
    await userEvent.click(c.getByRole('button', { name: 'Clear search' }));
    await expect(field).toHaveValue('');
    await expect(within(c.getByRole('list', { name: 'Results' })).getAllByRole('listitem')).toHaveLength(CUSTOMERS.length);
  },
};

export const NoResults: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByLabelText('Find a customer'), 'zzz');
    await expect(c.getByRole('status')).toHaveTextContent('No customers found.');
  },
};

export const Focus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByLabelText('Find a customer')).toHaveFocus();
  },
};

export const Hover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByLabelText('Find a customer'));
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText('Find a customer')).toBeDisabled();
  },
};

export const WithoutIcon: Story = { args: { hideIcon: true } };

export const AllStates: Story = {
  render: () => (
    <Row>
      <Specimen label="Empty"><SearchField aria-label="Empty" value="" placeholder="Search" onChange={fn()} onClear={fn()} /></Specimen>
      <Specimen label="Populated"><SearchField aria-label="Populated" value="Omar" onChange={fn()} onClear={fn()} /></Specimen>
      <Specimen label="Disabled"><SearchField aria-label="Disabled" value="" placeholder="Search" disabled onChange={fn()} /></Specimen>
      <Specimen label="hideIcon"><SearchField aria-label="No icon" hideIcon value="" placeholder="Search" onChange={fn()} /></Specimen>
    </Row>
  ),
};
