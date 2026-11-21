// Keeps styling and behaviour tests apart: outside tests/styling.test.mjs, a test must not assert the CSS classes of the components the shadcn / Radix migration
// replaced (button, field, tab, overlay, card, checkbox). Behaviour goes through tests/helpers/dom.mjs (role, name, state); look goes in styling.test.mjs and the
// pixel snapshots. Existing exceptions are listed with a count and may only shrink.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const COUPLED = /(?:class="[^"]*|\/|['"`])(?:btn-(?:primary|secondary|tertiary|destructive|sm|md|lg|icon)|form-control(?:-\w+)?|tab-active|tab-strip|tab-segment|modal-dialog|drawer-panel|scrim(?:-center)?|checkbox relative)\b/;
// A test that reads production SOURCE (a regex over a .tsx file) is a structure test, not a markup / behaviour test: only asserts over rendered markup count here.
const ALLOWED_FILES = new Set(['styling.test.mjs', 'testSeparation.test.mjs', 'domHelper.test.mjs']);
const BASELINE = {};

test('behavioural tests do not name the classes of the migrated components', () => {
  const found = {};
  for (const f of fs.readdirSync('tests').filter((x) => x.endsWith('.test.mjs') && !ALLOWED_FILES.has(x))) {
    const hits = fs.readFileSync(`tests/${f}`, 'utf8').split('\n').filter((l) => /assert\./.test(l) && COUPLED.test(l) && !/read\(|css\b|source|src\//i.test(l)).length;
    if (hits) found[f] = hits;
  }
  for (const [f, n] of Object.entries(found)) assert.ok(n <= (BASELINE[f] ?? 0), `${f}: ${n} assertion(s) on a migrated component's CSS class - assert role / name / state through tests/helpers/dom.mjs, or move the look to tests/styling.test.mjs`);
});

test('the behavioural tests use the markup reader, not regular expressions over the markup string, for roles, names and states', () => {
  for (const f of ['ui.test.mjs', 'baselineContracts.test.mjs', 'pilotEnterpriseAccount.test.mjs']) {
    assert.match(fs.readFileSync(`tests/${f}`, 'utf8'), /from '\.\/helpers\/dom\.mjs'/, f);
  }
});
