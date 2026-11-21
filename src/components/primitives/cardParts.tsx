import { Icon } from './Icon';
import { CHECK } from '../../assets/icons';

// Selectable-card states and marks, shared by every card grid in the app (offers, plans, numbers, choice cards).

/** The selectable-card states, one definition for every card grid that uses them (offers, plans, numbers). */
export const CARD_SELECTED = 'card-selected';
export const CARD_IDLE = 'card-idle';
/** A card the app singles out (the Recommended offer, a Popular plan): blue border, flat soft blue wash (red is kept for the selected card). */
export const CARD_HIGHLIGHT = 'card-highlight';

/** The faint concentric circles at the bottom-right of a selected card, behind its content (the card needs `isolate`). Clipped to the card's own rounded corners. */
export function SelectedCardTexture() {
  return (
    <span aria-hidden="true" className="card-art-layer">
      <svg viewBox="0 0 120 120" className="card-art-mark">
        <circle cx="70" cy="70" r="50" fill="var(--accent)" fillOpacity="0.06" />
        <circle cx="90" cy="90" r="34" fill="var(--accent)" fillOpacity="0.06" />
      </svg>
    </span>
  );
}



/**
 * The selected mark: a red circle with a tick on the card's top-right corner. Put it inside a `relative` card, only while it is selected.
 * Styled by `.card-tick` (src/index.css). The one selected mark for every selectable card in the app (with CARD_SELECTED's red border and warm fill); the whole card is the control, so no card has its own Select button.
 */
export function SelectedTick() {
  return (
    <span aria-hidden className="card-tick">
      <Icon path={CHECK} className="size-4 " strokeWidth={3} />
    </span>
  );
}
