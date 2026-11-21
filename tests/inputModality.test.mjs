// A selected tab wears no focus ring after a mouse click; a key press (or a focus nobody clicked) brings the ring back.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load, close } from './harness.mjs';

let track;
before(async () => {
  ({ trackInputModality: track } = await load('/src/lib/inputModality.ts'));
});
after(close);

// A page stand-in: the root element's data attributes and the listeners the tracker adds.
const fakeDocument = () => {
  const listeners = {};
  return {
    documentElement: { dataset: {} },
    addEventListener: (t, fn) => (listeners[t] = fn),
    removeEventListener: (t) => delete listeners[t],
    fire: (t, e = {}) => listeners[t]?.(e),
    listeners,
  };
};

test('a pointer press marks the page as pointer-driven and a key press clears it', () => {
  const doc = fakeDocument();
  track(doc);
  assert.equal(doc.documentElement.dataset.input, undefined, 'before any interaction the ring behaves as normal');
  doc.fire('pointerdown');
  assert.equal(doc.documentElement.dataset.input, 'pointer');
  doc.fire('keydown', { key: 'Shift' });
  assert.equal(doc.documentElement.dataset.input, 'pointer', 'a bare modifier is not a keyboard interaction');
  doc.fire('keydown', { key: 'Tab' });
  assert.equal(doc.documentElement.dataset.input, undefined, 'Tab brings the ring back');
  doc.fire('pointerdown');
  doc.fire('keydown', { key: 'ArrowRight' });
  assert.equal(doc.documentElement.dataset.input, undefined);
});

test('stopping the tracker removes its listeners and the attribute', () => {
  const doc = fakeDocument();
  const stop = track(doc);
  doc.fire('pointerdown');
  stop();
  assert.equal(doc.documentElement.dataset.input, undefined);
  assert.deepEqual(Object.keys(doc.listeners), []);
});

test('the tab focus ring is gated on the modality, for both tab styles', () => {
  const css = fs.readFileSync('src/styles/components.css', 'utf8');
  assert.match(css, /html:not\(\[data-input='pointer'\]\) \.tab:focus-visible \{\s*@apply shadow-\[var\(--focus-ring\)\]/);
  assert.match(css, /html:not\(\[data-input='pointer'\]\) \.tab-strip-filter \.tab:focus-visible/);
  assert.doesNotMatch(/\.tab \{[^}]*\}/.exec(css)?.[0] ?? '', /focus-visible/, 'the base .tab rule no longer shows the ring on its own');
});
