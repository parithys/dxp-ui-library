import type { KeyboardEventHandler, ReactNode, Ref } from 'react';
import { Card } from '../ui/card';

/**
 * The page body every guided step sits in: the step card (32px from the page edges, 24px padding) in the left column, with
 * anything that belongs under the card beneath it, and a summary column to its right. `bottomClass` leaves room
 * for a fixed action bar. Every guided flow lays its steps out with this, so the card, its margins and the room for
 * the action bar never differ between them.
 */
export function WizardStepPanel({
  panelRef,
  onKeyDown,
  cardClassName = '',
  bottomClass = 'pb-24',
  above,
  below,
  aside,
  children,
}: {
  panelRef?: Ref<HTMLDivElement>;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  cardClassName?: string;
  bottomClass?: string;
  /** Above the card, in the same column. */
  above?: ReactNode;
  /** Under the card, in the same column (for example a small-screen summary accordion). */
  below?: ReactNode;
  /** The right-hand column (a running summary). */
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`flex-1 flex items-stretch ${bottomClass}`}>
      <div className="flex-1 min-w-0">
        {above}
        <Card ref={panelRef} className={`m-8 p-6 ${cardClassName}`} onKeyDown={onKeyDown}>
          {children}
        </Card>
        {below}
      </div>
      {aside}
    </div>
  );
}
