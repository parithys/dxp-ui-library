import { createContext, useContext } from 'react';

// The contexts behind StatusSlot (see StatusSlot.tsx).
export const SlotContext = createContext<HTMLElement | null | undefined>(undefined);
export const SetSlotContext = createContext<((node: HTMLElement | null) => void) | undefined>(undefined);

/** True inside a <StatusSlotProvider>. */
export const useHasStatusSlot = (): boolean => useContext(SetSlotContext) !== undefined;
