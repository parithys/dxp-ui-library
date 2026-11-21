import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NestedTabs, PageLevelTabs, TabStrip } from '../../src';
import { docsParameters } from '../_shared/docs';
import { Column, Specimen } from '../_shared/layout';

const ITEMS = [{ key: 'a', label: 'First' }, { key: 'b', label: 'Second' }];

function Strip({ label }: { label: string }) {
  const [active, setActive] = useState('a');
  return <TabStrip items={ITEMS} active={active} onChange={setActive} label={label} />;
}

const meta = {
  title: 'Navigation/Tab Levels',
  component: NestedTabs,
  parameters: {
    ...docsParameters({
      purpose: 'Marks the tab hierarchy. Level 1 is page-level navigation; Level 2 is content-level navigation, tabs inside a tab\'s own content. NestedTabs adds a level for its children; PageLevelTabs resets to Level 1 (a live preview of a journey screen inside a tab panel).',
      source: 'src/components/primitives/TabLevel.tsx, tabDepth.ts',
      variants: ['NestedTabs: any tab strip inside is one level deeper.', 'PageLevelTabs: any tab strip inside is Level 1, even inside a NestedTabs.'],
      usage: ['Depth is tracked for structure and semantics; the look comes from the TabStrip `variant`, not from the depth. Wrap a tab\'s content in NestedTabs when it holds its own tabs.'],
      accessibility: ['No markup and no roles of their own; they only provide context to the TabStrip inside.'],
    }),
  },
  argTypes: { children: { control: false, description: 'Content holding one or more tab strips.' } },
  args: { children: null },
} satisfies Meta<typeof NestedTabs>;
export default meta;
type Story = StoryObj<typeof meta>;

function Wrapped({ children }: { children: ReactNode }) {
  return <div className="stack gap-3">{children}</div>;
}

export const Default: Story = {
  name: 'NestedTabs (Level 2)',
  render: () => (
    <Wrapped>
      <NestedTabs><Strip label="Level 2" /></NestedTabs>
    </Wrapped>
  ),
};

export const TabLevels: Story = {
  name: 'NestedTabs and PageLevelTabs',
  render: () => (
    <Column>
      <Specimen label="Inside a tab panel: Level 2 (NestedTabs)">
        <NestedTabs>
          <Strip label="Level 2" />
        </NestedTabs>
      </Specimen>
      <Specimen label="PageLevelTabs inside a NestedTabs: back to Level 1">
        <NestedTabs>
          <PageLevelTabs>
            <Strip label="Level 1" />
          </PageLevelTabs>
        </NestedTabs>
      </Specimen>
    </Column>
  ),
};
