import { useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { SetSlotContext, SlotContext } from './statusSlotContext';

// Where a step's status messages (the ID verification and validation panels, scan failures) are shown: in ONE place, directly under the step's title, whichever
// part of the step raises them. A step wraps its content in <StatusSlotProvider> and puts <StatusSlot /> at the top; any <StatusPortal> inside renders into that
// slot. A <StatusPortal> with no slot around it renders where it is, so a surface that has no slot is unchanged.

export function StatusSlotProvider({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<HTMLElement | null>(null);
  return (
    <SetSlotContext.Provider value={setNode}>
      <SlotContext.Provider value={node}>{children}</SlotContext.Provider>
    </SetSlotContext.Provider>
  );
}

/** The place the messages appear. Empty, it takes no room. */
export function StatusSlot() {
  const setNode = useContext(SetSlotContext);
  return <div ref={setNode} className="stack gap-3 mb-6 empty:hidden" />;
}

/** Renders its children in the step's status slot when there is one (once it has mounted), otherwise in place. */
export function StatusPortal({ children }: { children: ReactNode }) {
  const node = useContext(SlotContext);
  return node ? createPortal(children, node) : <>{children}</>;
}
