// Where a popover attached to a field opens: below the field when it fits there, else above when it fits there, else on whichever side has more
// room. "Room" is the visible space between the field and the edge of what can actually be seen - the viewport, narrowed by any scroll container
// that clips the popover and by a bar fixed over the page's bottom (the wizard's action bar) - measured by the caller.

export type PopoverSide = 'below' | 'above';

export function popoverSide(room: { above: number; below: number }, panelHeight: number): PopoverSide {
  if (room.below >= panelHeight) return 'below';
  if (room.above >= panelHeight) return 'above';
  return room.above > room.below ? 'above' : 'below';
}

/** The visible band (top and bottom, in viewport pixels) an element's popover can occupy: the viewport, narrowed by every ancestor that clips its
 *  overflow and by the top of any fixed bar laid over the bottom of the page (elements matching `bottomBars`). */
export function visibleBand(el: HTMLElement, bottomBars = '.action-bar'): { top: number; bottom: number } {
  let top = 0;
  let bottom = window.innerHeight;
  for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
    // Only an ancestor that cuts off what overflows it narrows the band (the page itself is the viewport, already counted).
    if (getComputedStyle(a).overflowY === 'visible') continue;
    const r = a.getBoundingClientRect();
    top = Math.max(top, r.top);
    bottom = Math.min(bottom, r.bottom);
  }
  for (const bar of document.querySelectorAll<HTMLElement>(bottomBars)) {
    const r = bar.getBoundingClientRect();
    // A bar only counts when it sits over the bottom of the band (not one scrolled away or above the field).
    if (r.height > 0 && r.top < bottom && r.bottom >= bottom - 1) bottom = Math.min(bottom, r.top);
  }
  return { top, bottom };
}
