import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { StatusPortal, StatusSlot, StatusSlotProvider } from '../../src';
import { docsParameters } from '../_shared/docs';

/** A status message that goes to the slot (the application's validation panels do the same through StatusPortal). */
function ValidationStatus({ title, children }: { variant?: string; title: string; children: ReactNode }) {
  return (
    <StatusPortal>
      <div role="alert" className="notice-danger"><strong>{title}</strong><p>{children}</p></div>
    </StatusPortal>
  );
}

const meta = {
  title: 'Feedback & Status/Status Slot',
  component: StatusSlot,
  parameters: {
    ...docsParameters({
      purpose:
        'Where a step\'s status messages (ID verification and validation panels, scan failures) are shown: in one place, directly under the step title, whichever part of the step raises them.',
      source: 'src/components/primitives/StatusSlot.tsx (contexts: statusSlotContext.ts)',
      variants: ['`StatusSlotProvider` wraps the step; `StatusSlot` is the place; `StatusPortal` sends its children there. The application validation and scan-failure panels already use it.'],
      states: ['Empty (takes no room)', 'One or more messages (stacked, in the order they appear)', 'No provider around (the message renders where it is, unchanged)'],
      usage: ['Put `StatusSlot` at the top of a step, inside its `StatusSlotProvider`. Do not move a message by hand: raise it with `StatusPortal`.'],
      accessibility: ['Each message keeps its own `role` (`alert` for a failure, `status` otherwise); moving it does not change what is announced.'],
    }),
  },
} satisfies Meta<typeof StatusSlot>;
export default meta;
type Story = StoryObj<typeof meta>;

export const MessagesGoToTheTop: Story = {
  render: () => (
    <StatusSlotProvider>
      <StatusSlot />
      <h3 className="title title-lg">Contact</h3>
      <div className="stack gap-3 pt-4">
        <p>The fields of the step.</p>
        {/* Raised from deep inside the step, shown above its title's content, in the slot. */}
        <ValidationStatus variant="business-failure" title="ID Not Found in MOI">
          No MOI record found for this ID - try again.
        </ValidationStatus>
        <StatusPortal>
          <p>Anything sent to the portal appears in the slot too.</p>
        </StatusPortal>
      </div>
    </StatusSlotProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = await canvas.findByRole('alert');
    const heading = canvas.getByRole('heading', { name: 'Contact' });
    // The message sits before the step's own content.
    await expect(alert.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  },
};

export const WithoutASlotItStaysInPlace: Story = {
  render: () => (
    <div className="stack gap-3">
      <p>Fields</p>
      <ValidationStatus variant="technical" title="MOI Is Unavailable">
        The service did not answer. Nothing is decided.
      </ValidationStatus>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole('alert')).toHaveTextContent('MOI Is Unavailable');
  },
};
