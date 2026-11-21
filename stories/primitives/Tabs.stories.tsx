import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { TabStrip, Tabs, BaseTabs as RadixTabs, TabsContent, TabsList, TabsTrigger } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Column, Specimen } from '../_shared/layout';

const ITEMS = [
  { key: 'open', label: 'Open Tasks', count: 4 },
  { key: 'drafts', label: 'Drafts', count: 3 },
  { key: 'done', label: 'Completed' },
];

function ControlledStrip(props: { items: { key: string; label: string; count?: number }[]; variant?: 'navigation' | 'filter'; label?: string; initial?: string; onChange?: (key: string) => void }) {
  const [active, setActive] = useState(props.initial ?? props.items[0]?.key);
  return (
    <TabStrip
      items={props.items}
      active={active}
      variant={props.variant}
      label={props.label}
      onChange={(k) => {
        setActive(k);
        props.onChange?.(k);
      }}
    />
  );
}

const meta = {
  title: 'Navigation/Tabs',
  component: TabStrip,
  parameters: {
    ...docsParameters({
      purpose:
        'The horizontal tab strip (TabStrip) on the shadcn / Radix Tabs (components/ui/tabs.tsx). Use it to move between sections or views of one page (navigation variant) or to narrow the same data shown below (filter variant). `Tabs` wraps it with a panel, a vertical list or the numbered step rail.',
      source: 'src/components/primitives/TabStrip.tsx, src/components/primitives/Tabs.tsx, src/components/ui/tabs.tsx',
      variants: [
        'TabStrip variant "navigation" (default): underline, selected tab in the accent colour with a thicker underline.',
        'TabStrip variant "filter": segmented, bordered frame; ONLY for tabs that re-slice the same data below.',
        'Tabs orientation "horizontal" (strip + panel, optional toolbar on the tab row), "vertical" (side list) and "vertical" + rail (numbered icon rail the guided wizards use).',
      ],
      states: ['Selected / unselected', 'Hover and keyboard focus (focus ring from the app tokens)', 'Count badge (red on the selected tab, grey otherwise)', 'Overflow: the strip scrolls sideways instead of wrapping'],
      events: ['onChange(key) on TabStrip and Tabs; Radix selects a tab as soon as it receives arrow-key focus.'],
      usage: ['Navigation tabs switch the section shown below; do not use the filter variant for page sections.', 'There is no per-tab disabled prop on TabStrip / Tabs, so there is no Disabled story.'],
      accessibility: [
        'role="tablist" named by `label`; each tab is role="tab" with aria-selected; only the selected tab is in the Tab order (roving tabindex).',
        'ArrowLeft / ArrowRight move and select (wrapping); Home / End and PageUp / PageDown jump to the first / last tab.',
        'Triggers carry no aria-controls: the app renders the selected view itself, outside the tabs.',
        'The vertical rail is a nav named "Customer sections"; the active item has aria-current="step"; collapsed rows are icon-only with a tooltip and aria-label.',
      ],
      devices: ['Tablet touch targets scale through the app\'s --control-h tokens; the rail becomes a horizontal icon strip below the lg breakpoint (see the Mobile story).'],
    }),
  },
  argTypes: {
    variant: { control: 'select', options: ['navigation', 'filter'], description: 'navigation = underline; filter = segmented frame (filters only).' },
    label: { control: 'text', description: 'Accessible name of the tab list.' },
    items: { control: 'object', description: 'Tabs: key, label and optional count.' },
    active: { control: false, description: 'The selected key (controlled).' },
    onChange: { control: false },
    className: { control: false },
  },
  args: { items: ITEMS, active: 'open', label: 'Task views', variant: 'navigation', onChange: fn() },
} satisfies Meta<typeof TabStrip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <ControlledStrip items={args.items} variant={args.variant} label={args.label} initial={args.active} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const tabs = c.getAllByRole('tab');
    await expect(tabs).toHaveLength(3);
    await expect(c.getByRole('tab', { name: /Open Tasks/ })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(c.getByRole('tab', { name: /Drafts/ }));
    await expect(c.getByRole('tab', { name: /Drafts/ })).toHaveAttribute('aria-selected', 'true');
    await expect(c.getByRole('tab', { name: /Open Tasks/ })).toHaveAttribute('aria-selected', 'false');
  },
};

export const Filter: Story = {
  args: { variant: 'filter', label: 'Status filter', items: [{ key: 'all', label: 'All', count: 12 }, { key: 'active', label: 'Active', count: 8 }, { key: 'closed', label: 'Closed', count: 4 }], active: 'all' },
  render: (args) => <ControlledStrip items={args.items} variant={args.variant} label={args.label} initial={args.active} />,
};

export const WithCounts: Story = {
  render: (args) => <ControlledStrip items={args.items} label={args.label} initial="drafts" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('tab', { name: /Drafts/ })).toHaveTextContent('3');
  },
};

export const Selected: Story = {
  name: 'Selected / Unselected',
  render: (args) => <ControlledStrip items={args.items} initial="done" label={args.label} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('tab', { name: 'Completed' })).toHaveAttribute('aria-selected', 'true');
    await expect(c.getByRole('tab', { name: /Open Tasks/ })).toHaveAttribute('data-state', 'inactive');
  },
};

export const Hover: Story = {
  render: (args) => <ControlledStrip items={args.items} label={args.label} />,
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('tab', { name: /Drafts/ }));
  },
};

export const Focus: Story = {
  name: 'Focus (keyboard)',
  render: (args) => <ControlledStrip items={args.items} label={args.label} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.tab();
    await expect(c.getByRole('tab', { name: /Open Tasks/ })).toHaveFocus();
  },
};

export const KeyboardNavigation: Story = {
  render: (args) => <ControlledStrip items={args.items} label={args.label} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(c.getByRole('tab', { name: /Drafts/ })).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{End}');
    await expect(c.getByRole('tab', { name: 'Completed' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(c.getByRole('tab', { name: /Open Tasks/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(c.getByRole('tab', { name: 'Completed' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(c.getByRole('tab', { name: /Open Tasks/ })).toHaveFocus();
    await userEvent.keyboard('{PageDown}');
    await expect(c.getByRole('tab', { name: 'Completed' })).toHaveFocus();
    await userEvent.keyboard('{PageUp}');
    await expect(c.getByRole('tab', { name: /Open Tasks/ })).toHaveFocus();
  },
};

const MANY = Array.from({ length: 14 }, (_, i) => ({ key: `t${i}`, label: `Section number ${i + 1}`, count: i % 3 === 0 ? i + 1 : undefined }));

export const Overflow: Story = {
  name: 'Overflow (scrolls sideways)',
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <ControlledStrip items={MANY} label={args.label} />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <Column>
      <Specimen label="Navigation (underline)"><ControlledStrip items={ITEMS} label="Navigation" /></Specimen>
      <Specimen label="Filter (segmented)"><ControlledStrip items={ITEMS} variant="filter" label="Filter" /></Specimen>
    </Column>
  ),
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
  render: (args) => <ControlledStrip items={MANY} label={args.label} />,
};

export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
  render: (args) => <ControlledStrip items={args.items} label={args.label} />,
};

export const TabsWithPanel: Story = {
  name: 'Tabs: strip with panel',
  render: () => (
    <Tabs
      label="Customer sections"
      items={[
        { key: 'summary', label: 'Summary', content: <p className="text-secondary">Summary panel content.</p> },
        { key: 'history', label: 'History', content: <p className="text-secondary">History panel content.</p> },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('Summary panel content.')).toBeInTheDocument();
    await userEvent.click(c.getByRole('tab', { name: 'History' }));
    await expect(c.getByText('History panel content.')).toBeInTheDocument();
    await expect(c.queryByText('Summary panel content.')).toBeNull();
  },
};

export const TabsWithToolbar: Story = {
  name: 'Tabs: toolbar on the tab row',
  render: () => (
    <Tabs
      label="Orders"
      toolbar={<span className="caption-muted">Toolbar slot (search, filters)</span>}
      items={[
        { key: 'a', label: 'Orders', content: <p className="text-secondary">Orders.</p> },
        { key: 'b', label: 'Quotes', content: <p className="text-secondary">Quotes.</p> },
      ]}
    />
  ),
};

export const TabsVertical: Story = {
  name: 'Tabs: vertical list',
  render: () => (
    <Tabs
      orientation="vertical"
      items={[
        { key: 'a', label: 'Profile', content: <p className="text-secondary">Profile content.</p> },
        { key: 'b', label: 'Security', content: <p className="text-secondary">Security content.</p> },
        { key: 'c', label: 'Notifications', content: <p className="text-secondary">Notification content.</p> },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Security' }));
    await expect(c.getByText('Security content.')).toBeInTheDocument();
  },
};

export const TabsVerticalRail: Story = {
  name: 'Tabs: numbered step rail (IconRail)',
  render: () => (
    <Tabs
      orientation="vertical"
      rail
      items={[
        { key: 'contact', label: 'Contact', content: <p className="text-secondary">Contact step content.</p> },
        { key: 'address', label: 'Address', content: <p className="text-secondary">Address step content.</p> },
        { key: 'plan', label: 'Plan', content: <p className="text-secondary">Plan step content.</p> },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    window.localStorage.removeItem('vfq-rail-expanded');
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Address' }));
    await expect(c.getByText('Address step content.')).toBeInTheDocument();
    const toggle = c.getByRole('button', { name: /Collapse sections|Expand sections/ });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded');
  },
};

export const TabsControlled: Story = {
  name: 'Tabs: controlled (onChange)',
  args: { onChange: fn() },
  render: (args) => {
    const [key, setKey] = useState('a');
    return (
      <Tabs
        label="Controlled"
        activeKey={key}
        onChange={(k) => {
          setKey(k);
          args.onChange(k);
        }}
        items={[
          { key: 'a', label: 'First', content: <p className="text-secondary">First.</p> },
          { key: 'b', label: 'Second', content: <p className="text-secondary">Second.</p> },
        ]}
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('tab', { name: 'Second' }));
    await expect(args.onChange).toHaveBeenCalledWith('b');
  },
};

export const PrimitiveRadixTabs: Story = {
  name: 'ui/tabs (Radix building blocks)',
  render: () => (
    <RadixTabs defaultValue="one">
      <TabsList aria-label="Radix tabs">
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
        <TabsTrigger value="three" disabled>Three (disabled)</TabsTrigger>
      </TabsList>
      <TabsContent value="one"><p className="text-secondary">Panel one.</p></TabsContent>
      <TabsContent value="two"><p className="text-secondary">Panel two.</p></TabsContent>
    </RadixTabs>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('tab', { name: /Three/ })).toBeDisabled();
    await userEvent.click(c.getByRole('tab', { name: 'Two' }));
    await expect(c.getByText('Panel two.')).toBeInTheDocument();
  },
};
