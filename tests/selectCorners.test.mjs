// A closed Select keeps all four rounded corners, focused or not; only the edge that joins the OPEN list is square.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('the select field squares a corner only while its list is open, never on focus alone', () => {
  const s = fs.readFileSync('src/components/primitives/Select.tsx', 'utf8');
  assert.doesNotMatch(s, /focus-visible:rounded-(b|t)-none/, 'no corner is squared by focus');
  assert.match(s, /\$\{open \? \(openUp \? 'rounded-t-none' : 'rounded-b-none'\) : ''\}/, 'the joining edge is squared while the list is open');
});
