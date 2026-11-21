// One look for every unselected card's icon tile: the fill and the icon colour live in the design system's glyph classes, and a card only says whether it is selected.
// (The app's own cards are checked in prototype/tests/cardGlyph.test.mjs.)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('src/styles/components.css', 'utf8');
const rule = (selector) => new RegExp(`${selector.replace('.', '\\.')} \\{[^}]*\\}`).exec(css)?.[0] ?? '';
const read = (p) => fs.readFileSync(p, 'utf8');

test('the card glyph classes carry the unselected fill and icon colour, and .glyph-chosen is the selected one', () => {
  for (const cls of ['.option-glyph', '.icon-box']) assert.match(rule(cls), /bg-\[var\(--icon-tile-bg\)\] text-\[var\(--icon-tile-fg\)\]/, cls);
  assert.match(rule('.glyph-chosen'), /bg-\[image:var\(--accent-gradient\)\] text-accent-on/, 'the selected glyph is the primary button\'s gradient');
  assert.ok(css.indexOf('.glyph-chosen {') > css.indexOf('.option-glyph {'), 'the selected glyph is defined after the base, so it wins');
  assert.ok(css.indexOf('.glyph-chosen {') > css.indexOf('.icon-box {'));
});

test('the library ChoiceCards colours no unselected glyph of its own, and its selected card is not told by a red label', () => {
  const s = read('src/components/primitives/ChoiceCards.tsx');
  assert.doesNotMatch(s, /bg-surface-warm text-accent'/, 'the pink unselected tile');
  assert.doesNotMatch(s, /: 'icon-tint'/, 'the colours come from the glyph class, not an added icon-tint');
  assert.match(s, /option-glyph|icon-box/, 'uses a card glyph class');
  assert.doesNotMatch(s, /text-\[var\(--field-card-selected\)\]/);
  assert.doesNotMatch(css, /\.icon-tile-raised/, 'the raised white tile is gone');
});

test('a selected card and a status badge are told apart by more than colour: tick, 2px edge; the badge is flat, 1px and tick-free', () => {
  const r = (sel) => new RegExp(`${sel.replace(/[.[\]()]/g, '\\$&')} \\{([^}]*)\\}`).exec(css)?.[1] ?? '';
  assert.match(r('.card-tick'), /display: flex/);
  assert.match(r('.card-selected'), /shadow-\[var\(--shadow-selected-ring\)\]/);
  assert.doesNotMatch(r('.eligibility-alert-icon'), /gradient/);
  assert.doesNotMatch(r('.eligibility-alert'), /border-2|card-tick|gradient/);
});

test('the selected tick renders above the card (a z-index token), so a card corner never clips it', () => {
  assert.match(read('src/components/primitives/cardParts.tsx'), /SelectedTick[\s\S]*card-tick/);
  assert.match(css, /\.card-tick \{[^}]*z-index: var\(--z-raised\)/);
});
