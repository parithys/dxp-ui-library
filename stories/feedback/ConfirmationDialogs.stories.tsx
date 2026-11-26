import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../../src/components/ui/button';
import { RemoveDocumentDialog } from '../../src/components/primitives/RemoveDocumentDialog';
import { AbandonDialog, LeaveJourneyDialog, SaveExitDialog } from '../../src/components/primitives/WizardDialogs';
import { docsParameters } from '../_shared/docs';

// The guided flow's confirmation prompts: all are `Modal`s, controlled by the caller.
const meta = {
  title: 'Feedback & Status/Confirmation Dialogs',
  component: RemoveDocumentDialog,
  parameters: {
    ...docsParameters({
      purpose: 'The library\'s ready-made confirmation Modals: remove a document, abandon an order, save as draft, leave a journey.',
      source: 'src/components/primitives/RemoveDocumentDialog.tsx; src/components/primitives/WizardDialogs.tsx',
      variants: [
        'RemoveDocumentDialog: open while `fileName` is defined; Cancel keeps the document, Remove runs `onConfirm`.',
        'AbandonDialog: a required comment gates "Abandon Order"; `noKeep` (a step-initiated hard stop) hides "Keep Working" and the comment and only dismisses.',
        'SaveExitDialog: optional comment, Keep Working / Save as Draft.',
        'LeaveJourneyDialog: Abandon Journey / Save as Draft, both disabled while `busy`; closing stays on the journey.',
      ],
      states: ['Closed', 'Open', 'Confirm disabled (comment missing; busy)'],
      events: ['`onCancel` / `onClose` / `onStay` - X, Escape, scrim click or Cancel.', '`onConfirm` / `onSave` / `onAbandon` - the committing action.'],
      accessibility: ['Each is a `Modal`: `role="dialog"`, `aria-modal`, named by its title, focus trapped and returned to the opener, Escape closes.', 'The Abandon comment is a labelled, required Textarea with an error message.'],
      restrictions: ['The leave prompt is opened by the host (for example from a router navigation blocker); here the dialog is rendered directly.'],
    }),
  },
} satisfies Meta<typeof RemoveDocumentDialog>;
export default meta;
type Story = StoryObj<typeof RemoveDocumentDialog>;

const dialog = () => within(document.body).findByRole('dialog');
const closed = () => waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());

function RemoveDemo({ startOpen = false }: { startOpen?: boolean }) {
  const [file, setFile] = useState<string | undefined>(startOpen ? 'passport-front.pdf' : undefined);
  const [removed, setRemoved] = useState(false);
  return (
    <>
      <Button onClick={() => setFile('passport-front.pdf')}>Remove document</Button>
      {removed && <p role="status" className="caption-muted">Removed</p>}
      <RemoveDocumentDialog
        fileName={file}
        onCancel={() => setFile(undefined)}
        onConfirm={() => {
          setRemoved(true);
          setFile(undefined);
        }}
      />
    </>
  );
}

export const Default: Story = {
  render: () => <RemoveDemo />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Remove document' }));
    const d = await dialog();
    await expect(d).toHaveAccessibleName('Remove this document?');
    await expect(d).toHaveTextContent('passport-front.pdf');
    await userEvent.click(within(d).getByRole('button', { name: 'Cancel' }));
    await closed();
  },
};

export const RemoveConfirmed: Story = {
  render: () => <RemoveDemo />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Remove document' }));
    const d = await dialog();
    await userEvent.click(within(d).getByRole('button', { name: 'Remove Document' }));
    await closed();
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Removed');
  },
};

export const RemoveEscape: Story = {
  render: () => <RemoveDemo startOpen />,
  play: async () => {
    await dialog();
    await userEvent.keyboard('{Escape}');
    await closed();
  },
};

function AbandonDemo({ noKeep = false }: { noKeep?: boolean }) {
  const [open, setOpen] = useState(true);
  const [comments, setComments] = useState('');
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abandon order</Button>
      <AbandonDialog open={open} noKeep={noKeep} comments={comments} onCommentsChange={setComments} onClose={() => setOpen(false)} onConfirm={() => setOpen(false)} />
    </>
  );
}

export const AbandonOrder: Story = {
  render: () => <AbandonDemo />,
  play: async () => {
    const d = await dialog();
    const confirm = within(d).getByRole('button', { name: 'Abandon Order' });
    await expect(confirm).toBeDisabled();
    await userEvent.type(within(d).getByRole('textbox', { name: /Comments/ }), 'Customer left');
    await expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    await closed();
  },
};

export const AbandonHardStop: Story = {
  name: 'Abandon order (hard stop, noKeep)',
  render: () => <AbandonDemo noKeep />,
  play: async () => {
    const d = await dialog();
    await expect(within(d).queryByRole('button', { name: 'Keep Working' })).toBeNull();
    await userEvent.click(within(d).getByRole('button', { name: 'Abandon Order' }));
    await closed();
  },
};

export const SaveAsDraft: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(true);
      const [comments, setComments] = useState('');
      return <SaveExitDialog open={open} comments={comments} onCommentsChange={setComments} onClose={() => setOpen(false)} onConfirm={() => setOpen(false)} />;
    };
    return <Demo />;
  },
  play: async () => {
    const d = await dialog();
    await userEvent.click(within(d).getByRole('button', { name: 'Keep Working' }));
    await closed();
  },
};

export const LeaveJourney: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(true);
      return <LeaveJourneyDialog open={open} busy={false} onSave={fn()} onAbandon={fn()} onStay={() => setOpen(false)} />;
    };
    return <Demo />;
  },
  play: async () => {
    const d = await dialog();
    await expect(d).toHaveAccessibleName('Leave this journey?');
    await userEvent.keyboard('{Escape}');
    await closed();
  },
};

export const LeaveJourneyBusy: Story = {
  render: () => <LeaveJourneyDialog open busy onSave={fn()} onAbandon={fn()} onStay={fn()} />,
  play: async () => {
    const d = await dialog();
    await expect(within(d).getByRole('button', { name: 'Working…' })).toBeDisabled();
    await expect(within(d).getByRole('button', { name: 'Abandon Journey' })).toBeDisabled();
  },
};
