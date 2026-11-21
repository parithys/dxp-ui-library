import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within, screen } from 'storybook/test';
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../../src';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Navigation/Dropdown Menu',
  component: DropdownMenu,
  parameters: {
    ...docsParameters({
      purpose: 'The stock shadcn/ui Radix Dropdown Menu: a button that opens a list of actions, with checkbox and radio items, groups, separators and sub-menus. Applications build their own menus (customer actions, profile) on top of it.',
      source: 'src/components/ui/dropdown-menu.tsx',
      variants: ['Item `variant`: `default`, `destructive`.', 'Item kinds: plain, checkbox, radio, with a shortcut hint, inset, sub-menu.'],
      states: ['Closed, open, item focused, item disabled, checkbox / radio checked.'],
      events: ['`onSelect` on an item; `onCheckedChange` on a checkbox item; `onValueChange` on a radio group; `onOpenChange` on the menu.'],
      accessibility: ['Radix menu: `role="menu"`, arrow-key navigation, Home / End, type-ahead, Escape closes and returns focus to the trigger.'],
      restrictions: ['Unstyled by the app\'s semantic classes: it carries the stock shadcn look. Use it for new menus; do not restyle it per call site.'],
    }),
  },
  args: { onOpenChange: fn() },
} satisfies Meta<typeof DropdownMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild><Button variant="secondary">Actions</Button></DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Order</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>View<DropdownMenuShortcut>V</DropdownMenuShortcut></DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem disabled>Archive (disabled)</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Cancel order</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Actions' }));
    await expect(await screen.findByRole('menu')).toBeInTheDocument();
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);
    await expect(screen.getByRole('menuitem', { name: 'Archive (disabled)' })).toHaveAttribute('aria-disabled', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  },
};

export const Open: Story = {
  render: Default.render,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Actions' }));
    await expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
  },
};

export const CheckboxAndRadioItems: Story = {
  render: function Render(args) {
    const [dense, setDense] = useState(true);
    const [sort, setSort] = useState('name');
    return (
      <DropdownMenu {...args}>
        <DropdownMenuTrigger asChild><Button variant="secondary">View</Button></DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={dense} onCheckedChange={setDense}>Dense rows</DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="name">Sort by name</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="date">Sort by date</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'View' }));
    const dense = await screen.findByRole('menuitemcheckbox', { name: 'Dense rows' });
    await expect(dense).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(dense);
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'View' }));
    await userEvent.click(await screen.findByRole('menuitemradio', { name: 'Sort by date' }));
  },
};

export const SubMenu: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild><Button variant="secondary">Share</Button></DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Copy link</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Send to</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuItem>SMS</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
