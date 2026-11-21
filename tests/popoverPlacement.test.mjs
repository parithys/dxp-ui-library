// The calendar (and any field popover) opens below its field when it fits, else above when it fits, else on the roomier side.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load, close } from './harness.mjs';

after(close);

test('popoverSide: below when it fits, above when only that fits, the roomier side when neither does', async () => {
  const { popoverSide } = await load('/src/lib/popoverPlacement.ts');
  const PANEL = 380;
  // [room above, room below, expected] - written from the rule, not the code.
  const CASES = [
    [0, 600, 'below'], // top of the page: plenty below
    [600, 600, 'below'], // fits both ways: below is the default
    [500, 380, 'below'], // exactly fits below
    [500, 379, 'above'], // one pixel short below, fits above (the Expiry Date field over the action bar)
    [379, 100, 'above'], // fits neither: above has more room
    [200, 300, 'below'], // fits neither: below has more room
    [200, 200, 'below'], // fits neither, a tie: stays below
  ];
  for (const [above, below, expected] of CASES) assert.equal(popoverSide({ above, below }, PANEL), expected, `above ${above}, below ${below}`);
});

test('the date field\'s calendar is placed by that rule, measured against the visible band, before it paints', () => {
  const src = fs.readFileSync('src/components/primitives/DateInput.tsx', 'utf8');
  assert.match(src, /useLayoutEffect\(\(\) => \{\s*const place = /, 'measured before the first paint');
  assert.match(src, /visibleBand\(field\)/);
  assert.match(src, /popoverSide\(\{ above: r\.top - band\.top, below: band\.bottom - r\.bottom \}/);
  assert.match(src, /className=\{`date-panel \$\{side === 'above' \? 'date-panel-above' : ''\}`\}/);
  const css = fs.readFileSync('src/styles/components.css', 'utf8');
  assert.match(css, /\.date-panel-above \{\s*@apply top-auto bottom-full mt-0 mb-1;/);
  // The fixed action bar over the page bottom is counted as no room.
  assert.match(fs.readFileSync('src/lib/popoverPlacement.ts', 'utf8'), /bottomBars = '\.action-bar'/);
});
