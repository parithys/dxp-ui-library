// How the user last interacted: with a pointer (mouse, touch, pen) or with the keyboard. The browser's `:focus-visible` is not reliable for a control that
// moves its own focus when it is activated (a selected tab, for example, can read as keyboard-focused after a plain click), so a control that must not show
// its focus ring after a click reads this instead: `html[data-input='pointer']` is set by a pointer press and cleared by the next key press.
// Until the user has pressed anything the attribute is absent, and a focus ring behaves as normal (a keyboard or programmatic focus shows it).
// Imports nothing from the rest of the app.

/** Starts tracking on `doc` (default: the page). Returns the function that stops it. */
export function trackInputModality(doc: Document = document): () => void {
  const root = doc.documentElement;
  const onPointer = () => {
    root.dataset.input = 'pointer';
  };
  const onKey = (e: KeyboardEvent) => {
    // A bare modifier is not a keyboard interaction with the page.
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;
    delete root.dataset.input;
  };
  doc.addEventListener('pointerdown', onPointer, true);
  doc.addEventListener('keydown', onKey, true);
  return () => {
    doc.removeEventListener('pointerdown', onPointer, true);
    doc.removeEventListener('keydown', onKey, true);
    delete root.dataset.input;
  };
}
