import { useState } from 'react';
import { RemoveDocumentDialog } from './RemoveDocumentDialog';

/**
 * Every way of taking an uploaded document out goes through this: `confirmRemoval(name, remove)` opens the warning, and `remove` runs only when the agent confirms.
 * Render `dialog` once in the component that holds the documents.
 */
export function useConfirmedRemoval() {
  const [asking, setAsking] = useState<{ name: string; run: () => void } | undefined>();
  const dialog = (
    <RemoveDocumentDialog
      fileName={asking?.name}
      onCancel={() => setAsking(undefined)}
      onConfirm={() => {
        asking?.run();
        setAsking(undefined);
      }}
    />
  );
  return { confirmRemoval: (name: string, run: () => void) => setAsking({ name, run }), dialog };
}
