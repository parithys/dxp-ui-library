import { Button } from '../ui/button';
import { Modal } from './Modal';
import { WARNING } from '../../assets/icons/index';

/**
 * The confirmation shown before an uploaded or scanned document is removed. `fileName` is the document asked about (the dialog is closed while it is undefined);
 * Cancel keeps it, Remove runs `onConfirm`. Used wherever a screen asks "are you sure" for a document it holds.
 */
export function RemoveDocumentDialog({ fileName, onConfirm, onCancel }: { fileName: string | undefined; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal
      open={fileName !== undefined}
      onClose={onCancel}
      title="Remove this document?"
      icon={WARNING}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Remove Document</Button>
        </>
      }
    >
      <p className="body-text">
        <span className="font-medium">{fileName}</span> will be removed from this order. You can upload or scan it again afterwards.
      </p>
    </Modal>
  );
}
