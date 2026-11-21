import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup as html } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { load, close } from './harness.mjs';
import { parse, all, byRole, getByRole, nameOf, stateOf, text, tabbable } from './helpers/dom.mjs';

// Design-system component contracts and source guards for the library (the app's own guards are in prototype/tests/ui.test.mjs).
after(close);
const h = React.createElement;

test('Button: a native button named by its content, type=button unless told otherwise, inert when disabled', async () => {
  const { Button } = await load('/src/components/ui/button.tsx');
  const one = (props, label = 'Continue') => getByRole(parse(html(h(Button, props, label))), 'button');
  assert.equal(nameOf(one(null)), 'Continue');
  assert.equal(one(null).attrs.type, 'button', 'a button defaults to type=button, so it never submits a form by accident');
  assert.equal(one({ type: 'submit' }).attrs.type, 'submit');
  for (const variant of ['default', 'secondary', 'tertiary', 'destructive']) assert.equal(nameOf(one({ variant }, 'Go')), 'Go', variant); // the variant never changes what it is
  const off = one({ disabled: true });
  assert.equal(stateOf(off).disabled, true);
  assert.equal(tabbable(off), false);
  assert.equal(tabbable(one(null)), true);
  // How a variant or size LOOKS is asserted in tests/styling.test.mjs and by the pixel snapshots.
});

test('ChoiceCards: one radiogroup of icon cards - the chosen one is checked, ticked and highlighted; no native radio inputs', async () => {
  const { ChoiceCards } = await load('/src/components/primitives/ChoiceCards.tsx');
  const out = html(h(ChoiceCards, { legend: 'Port the number onto', items: [{ key: 'postpaid', label: 'Postpaid Plan', icon: 'M0 0' }, { key: 'prepaid', label: 'Prepaid Plan', icon: 'M0 0' }], value: 'prepaid', onChange() {} }));
  assert.match(out, /role="radiogroup"/);
  assert.equal((out.match(/role="radio"/g) ?? []).length, 2);
  assert.equal((out.match(/aria-checked="true"/g) ?? []).length, 1);
  assert.match(out, /aria-checked="true"[^>]*>.*Prepaid Plan/);
  assert.ok(!/type="radio"/.test(out));
});

test('TabStrip (navigation and filter): a named tablist of tabs, the active one selected, the count in its name, nothing pointing at a panel', async () => {
  const { TabStrip } = await load('/src/components/primitives/TabStrip.tsx');
  for (const [variant, items, label] of [
    ['navigation', [{ key: 'a', label: 'Open Tasks', count: 4 }, { key: 'b', label: 'Drafts', count: 3 }], 'Views'],
    ['filter', [{ key: 'a', label: 'Offers' }, { key: 'b', label: 'Plans' }], 'Filter'],
  ]) {
    const root = parse(html(h(TabStrip, { items, active: 'a', onChange() {}, label, variant })));
    assert.equal(nameOf(getByRole(root, 'tablist')), label);
    const tabs = byRole(root, 'tab');
    assert.equal(tabs.length, 2);
    assert.deepEqual(tabs.map((t) => stateOf(t).selected), [true, false], 'exactly the active tab is selected');
    assert.equal(text(tabs[0]).startsWith(items[0].label), true);
    if (items[0].count !== undefined) assert.ok(text(tabs[0]).endsWith(String(items[0].count)), 'the count is part of the tab');
    assert.ok(all(root).every((e) => e.attrs['aria-controls'] === undefined), 'the app renders its panel itself: nothing to point at');
    assert.equal(byRole(root, 'tabpanel').length, 0);
  }
  // The roving tabindex (the selected tab is the only tab stop) and the keys are Radix's, resolved in the browser: e2e/tabs.spec.ts.
});

test('Pager: hidden for one page; marks the current page; previous/next disable at the ends', async () => {
  const { Pager } = await load('/src/components/primitives/Pager.tsx');
  assert.equal(html(h(Pager, { page: 1, pages: 1, onPage() {} })), '');
  const out = html(h(Pager, { page: 1, pages: 3, onPage() {} }));
  assert.match(out, /aria-current="page"/);
  assert.equal((out.match(/disabled=""/g) ?? []).length, 1); // only Previous, on page 1
  const last = html(h(Pager, { page: 3, pages: 3, onPage() {} }));
  assert.equal((last.match(/disabled=""/g) ?? []).length, 1); // only Next, on the last page
});

test('Badge, Input and Select render labelled, accessible markup', async () => {
  const { Badge } = await load('/src/components/primitives/Badge.tsx');
  assert.match(html(h(Badge, { variant: 'success' }, 'Active')), /Active/);
  const { Input } = await load('/src/components/primitives/Input.tsx');
  const input = html(h(Input, { label: 'Email', value: '', onChange() {} }));
  assert.match(input, /<label/);
  assert.match(input, /Email/);
  const { Select } = await load('/src/components/primitives/Select.tsx');
  assert.match(html(h(Select, { label: 'Role', value: '', onChange() {}, options: [{ value: 'a', label: 'A' }], placeholder: 'Pick' })), /role="combobox"/);
});

test('ErrorBanner is an alert; Spinner is a status with a name', async () => {
  const { ErrorBanner } = await load('/src/components/primitives/ErrorBanner.tsx');
  assert.match(html(h(ErrorBanner, { message: 'Failed to load' })), /role="alert"/);
  assert.equal(html(h(ErrorBanner, {})), '');
  const { Spinner } = await load('/src/components/primitives/Spinner.tsx');
  assert.match(html(h(Spinner, { label: 'Loading' })), /role="status"[^>]*aria-label="Loading"|aria-label="Loading"[^>]*role="status"/);
});

// ---- Source-level guards for the rules this app enforces (fast, no browser) -----------------------------------------
const SRC = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'src');
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx')) files.push(p);
  }
})(SRC);
const read = (p) => fs.readFileSync(p, 'utf8');

test('guard: every <img> has alt text', () => {
  // `[^>]` would stop at the `=>` of an inline handler, so match the whole element up to its closing `/>`.
  const bad = files.filter((f) => (read(f).match(/<img\b[\s\S]*?\/>/g) ?? []).some((el) => !/\balt=/.test(el)));
  assert.deepEqual(bad.map((f) => path.relative(SRC, f)), []);
});

// The opening tag of every <name ...> in a source string, found by walking braces and strings - a regex that stops at the
// first `>` would stop at the `=>` of an inline handler and miss the attributes after it.
function openingTags(source, name) {
  const tags = [];
  const re = new RegExp(`<${name}(?=[\\s>/])`, 'g');
  let m;
  while ((m = re.exec(source))) {
    let i = m.index + m[0].length, depth = 0, quote = null;
    for (; i < source.length; i++) {
      const c = source[i];
      if (quote) { if (c === '\\') i++; else if (c === quote) quote = null; }
      else if (depth === 0 && (c === '"' || c === "'")) quote = c;
      else if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (depth > 0 && (c === '"' || c === "'" || c === '`')) quote = c;
      else if (depth === 0 && c === '>') break;
    }
    tags.push({ attrs: source.slice(m.index + m[0].length, i), line: source.slice(0, m.index).split('\n').length });
  }
  return tags;
}

test('guard: every hand-written <button> declares a type (so it never submits a form by accident)', () => {
  const bad = [];
  for (const f of files) {
    for (const t of openingTags(read(f), 'button')) {
      if (!/\btype=/.test(t.attrs) && !t.attrs.includes('{...')) bad.push(`${path.relative(SRC, f)}:${t.line}`);
    }
  }
  assert.deepEqual(bad, []);
});

// Data tables go through DataTable (sorting, paging, sticky header, keyboard rows, one look): no other raw <table> in the library.
const NON_DATA_TABLES = [];
test('guard: data tables use DataTable - a raw <table> is only for the allow-listed key-value / legal tables', () => {
  const bad = files
    .map((f) => path.relative(SRC, f))
    .filter((r) => r !== 'components/primitives/DataTable.tsx' && !NON_DATA_TABLES.includes(r))
    .filter((r) => /<table[\s>]/.test(read(path.join(SRC, r))));
  assert.deepEqual(bad, []);
});

test('guard: no red text links - links use --link', () => {
  const bad = [];
  for (const f of files) {
    const s = read(f);
    if (/<(?:a|Link|NavLink)\b[^>]*className="[^"]*\btext-accent\b(?![^"]*\bbg-)/.test(s)) bad.push(path.relative(SRC, f));
  }
  assert.deepEqual(bad, []);
});

test('guard: components use radius tokens, not Tailwind rounded-lg/xl/2xl', () => {
  const bad = files.filter((f) => !f.includes('/primitives/') && !f.includes('/components/ui/') && /\brounded-(?:md|lg|xl|2xl|3xl)\b/.test(read(f)));
  assert.deepEqual(bad.map((f) => path.relative(SRC, f)), []);
});

test('guard: colours, stacking and motion come from tokens - no hex/rgba, white/70, color-mix(), z-N or duration-N in components', () => {
  // Scans .ts as well as .tsx (class strings live in both). Comment lines are ignored. Brand artwork that
  // paints with literal SVG colours is a separate, allow-listed case and is not matched here.
  const all = [];
  (function walk(d) {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (/\.tsx?$/.test(p)) all.push(p);
    }
  })(SRC);
  const rawWhiteBlack = /(?<![\w-])(?:text|bg|border|ring|divide|from|to|via|fill|stroke|outline)-(?:white|black)(?![\w-])/;
  const alphaOnToken = /(?<![\w-])(?:text|bg|border|ring|divide)-(?:accent|danger|success|warn|info|link|fg|muted|surface|bg|white|black)\/\d+/;
  const literalColour = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;
  const literalRadius = /(?<![\w-])rounded-full(?![\w-])/;
  const literalScale = /(?<![\w-])-?z-(?:\d+|\[\d+\])(?![\w-])|(?<![\w-])duration-\d+(?![\w-])/;
  const bad = [];
  for (const f of all) {
    // Synthetic specimen artwork is demo data, not interface: its palette lives in src/data/synthetic.
    if (f.includes('/data/synthetic/')) continue;
    // The shadcn/ui components (src/components/ui) are vendored as generated: utility-class styled, with their own radius, stacking and motion.
    if (f.includes('/components/ui/')) continue;
    read(f).split('\n').forEach((line, i) => {
      if (/^\s*(?:\/\/|\*|\/\*|\{\/\*)/.test(line)) return;
      if (literalColour.test(line.replace(/\/\/.*$/, '')) || literalScale.test(line) || literalRadius.test(line)) bad.push(`${path.relative(SRC, f)}:${i + 1}`);
      if (rawWhiteBlack.test(line) || alphaOnToken.test(line) || /color-mix\(/.test(line)) bad.push(`${path.relative(SRC, f)}:${i + 1}`);
    });
  }
  assert.deepEqual(bad, []);
});

test('guard: no console.log or debugger left in the app', () => {
  const bad = files.filter((f) => /\bconsole\.log\(|\bdebugger\b/.test(read(f)));
  assert.deepEqual(bad.map((f) => path.relative(SRC, f)), []);
});


test('Tab hierarchy: a TabStrip is a tablist at every depth; Tabs nests its content', async () => {
  const { TabStrip } = await load('/src/components/primitives/TabStrip.tsx');
  const { NestedTabs } = await load('/src/components/primitives/TabLevel.tsx');
  const { Tabs } = await load('/src/components/primitives/Tabs.tsx');
  const strip = () => h(TabStrip, { items: [{ key: 'a', label: 'One' }, { key: 'b', label: 'Two' }], active: 'a', onChange() {} });
  assert.equal(byRole(parse(html(strip())), 'tablist').length, 1);
  assert.equal(byRole(parse(html(h(NestedTabs, null, strip()))), 'tablist').length, 1, 'nesting does not change what the strip is');
  const inTab = parse(html(h(Tabs, { items: [{ key: 'x', label: 'X', content: strip() }] })));
  assert.equal(byRole(inTab, 'tablist').length, 2, 'the page-level strip and the one inside its content');
  assert.equal(byRole(inTab, 'tab').length, 3);
});

test('no field shows placeholder / watermark text: the shared Input, Textarea, PhoneNumberInput and Select drop the prop', () => {
  for (const f of ['Input', 'Textarea']) assert.match(fs.readFileSync(`src/components/primitives/${f}.tsx`, 'utf8'), /placeholder: _noPlaceholder/, f);
  assert.doesNotMatch(fs.readFileSync('src/components/primitives/PhoneNumberInput.tsx', 'utf8'), /placeholder=\{/);
  assert.doesNotMatch(fs.readFileSync('src/components/primitives/Select.tsx', 'utf8'), /placeholder=\{/);
});

test('card hover is a pale fill and the form fields\' focus border colour: no card gains a ring or shadow on hover', () => {
  const offenders = [];
  (function walk(d) {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (/\.tsx?$/.test(p)) {
        fs.readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
          if (/hover:(ring|shadow-\[inset_0_0_0_1px)|hover:border-\[var\(--field-card/.test(line)) offenders.push(`${path.relative('src', p)}:${i + 1}`);
        });
      }
    }
  })('src');
  assert.deepEqual(offenders, [], 'a card hover changes the fill (hover:bg-[var(--field-card-hover-bg)]) and the border colour (hover:border-[var(--field-focus-border)]), not a ring or shadow');
  // ...and that border colour is the same one a form field takes on focus.
  const css = fs.readFileSync('src/styles/components.css', 'utf8');
  for (const cls of ['.card-idle', '.card-interactive', '.card-button']) assert.match(new RegExp(`\\${cls} \\{[^}]*hover:border-\\[var\\(--field-focus-border\\)\\]`).exec(css)?.[0] ?? '', /hover:border-\[var\(--field-focus-border\)\]/, cls);
  assert.doesNotMatch(fs.readFileSync('src/styles/tokens.css', 'utf8'), /--field-card-hover-border/);
});
