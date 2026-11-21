// Findings of the accessibility audit (2026-10-26) that concern the design system, kept fixed: Tabs is named, the colours the audit flagged meet
// WCAG 1.4.3 (4.5:1), no text token is under 12px, every <th> has a scope. The application's own findings are in prototype/tests/accessibilityAudit.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const lum = (hex) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };
// A token's colour as a hex, following `var(--other)` aliases (several tokens are aliases of one shade, e.g. --tag-blue-fg: var(--signal-blue)).
const token = (css, name, depth = 0) => {
  const value = new RegExp(`(?<![\\w-])${name}:\\s*([^;]+);`).exec(css)?.[1].trim();
  if (!value || depth > 6) return undefined;
  const alias = /^var\((--[\w-]+)\)$/.exec(value);
  return alias ? token(css, alias[1], depth + 1) : /^#[0-9a-fA-F]{6}$/.test(value) ? value : undefined;
};

test('the blue tag meets 4.5:1 on its own background (the Customer view button is checked in the application)', () => {
  const css = read('src/styles/tokens.css');
  assert.ok(contrast(token(css, '--tag-blue-fg'), token(css, '--tag-blue-bg')) >= 4.5, 'blue tag text');
});

test('the page-level Tabs and the data table have an accessible name and 24 px targets', () => {
  assert.match(read('src/components/primitives/Tabs.tsx'), /label = 'Sections'/);
  assert.match(read('src/components/primitives/Tabs.tsx'), /label=\{label\}/);
  assert.match(read('src/components/primitives/DataTable.tsx'), /sort-button/);
  assert.match(read('src/styles/components.css'), /\.sort-button \{[^}]*min-h-6/);
  assert.match(read('src/styles/components.css'), /\.tab\[data-state=active\] \{[^}]*bg-\[image:var\(--accent-gradient\)\][^}]*text-accent-on/);
});

test('the link, muted navigation text and field edges meet their contrast ratios on the surfaces they sit on', () => {
  const css = read('src/styles/tokens.css');
  const light = css.slice(0, css.indexOf(':root.dark'));
  const t = (n) => token(light, n);
  for (const surface of ['--bg', '--surface', '--page-bg', '--surface-warm'].filter((s) => t(s))) {
    assert.ok(contrast(t('--link'), t(surface)) >= 4.5, `link on ${surface}`);
    assert.ok(contrast(t('--nav-fg-muted'), t(surface)) >= 4.5, `muted nav text on ${surface}`);
  }
  for (const surface of ['--bg', '--surface', '--page-bg'].filter((s) => t(s))) assert.ok(contrast(t('--field-border'), t(surface)) >= 3, `field edge on ${surface} (WCAG 1.4.11)`);
});

test('no text token is under 12px and the select chevron is a 24px target', () => {
  const css = read('src/styles/tokens.css');
  for (const m of css.matchAll(/--fs-[\w-]+:\s*(\d+)px/g)) assert.ok(Number(m[1]) >= 12, `${m[0]} is under 12px`);
  const ui = read('src/styles/components.css');
  assert.match(ui, /\.select-chevron-btn \{[^}]*size-6/);
});

test('every <th> declares its scope, so a screen reader can tie a data cell to its header', () => {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${d}/${e.name}`) : /\.tsx$/.test(e.name) ? [`${d}/${e.name}`] : []));
  const missing = [];
  for (const f of walk('src')) {
    for (const m of read(f).matchAll(/<th(\s[^>]*)?>/g)) if (!/\bscope=/.test(m[1] ?? '')) missing.push(f);
  }
  assert.deepEqual(missing, [], '<th> without scope');
});
