// STYLING contracts of the design system: which semantic classes a component's API (variant, size, state) resolves to, and which rules the library's src/styles/components.css gives them.
// The app's layout contracts are in prototype/tests/styling.test.mjs. Kept apart from the behavioural tests on purpose: a behavioural test asserts role, name, state, keyboard and outcome and never mentions a class
// (it reads markup through tests/helpers/dom.mjs); this file is the ONLY place that names classes. Compared as sets of tokens (order and extra
// classes do not matter), so swapping a wrapper, an animation utility or the order of classes cannot fail it - only changing the look can.
// Rendered appearance is covered by the pixel snapshots in e2e/ (sweep, library groups, overlays, pilot), not here.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup as html } from 'react-dom/server';
import { load, close } from './harness.mjs';
import { parse, all, byRole, getByRole, nameOf } from './helpers/dom.mjs';

after(close);
const h = React.createElement;
const read = (f) => fs.readFileSync(f, 'utf8');
const css = read('src/styles/components.css');

/** The class tokens of the first element in `markup`, as a Set. */
const tokens = (markup) => new Set(((all(parse(markup))[0]?.attrs.class) ?? '').split(/\s+/).filter(Boolean));
const tokensOf = (el) => new Set((el.attrs.class ?? '').split(/\s+/).filter(Boolean));
const only = (set, re) => [...set].filter((t) => re.test(t)).sort();
/** Asserts the element carries every expected class (and optionally none of the forbidden ones). */
function hasClasses(set, expected, forbidden = [], msg = '') {
  for (const c of expected) assert.ok(set.has(c), `${msg} expected class "${c}" in [${[...set].join(' ')}]`);
  for (const c of forbidden) assert.ok(!set.has(c), `${msg} unexpected class "${c}" in [${[...set].join(' ')}]`);
}
/** The body of a CSS rule `.name { ... }` in components.css. */
const rule = (selector) => new RegExp(`${selector.replace(/[.[\]()]/g, '\\$&')} \\{([^}]*)\\}`).exec(css)?.[1] ?? '';

// ---- Button -----------------------------------------------------------------------------------------------------------------------------------
test('Button: every variant and size resolves to the app\'s semantic classes - what the retired primitives/Button rendered', async () => {
  const { Button } = await load('/src/components/ui/button.tsx');
  // The retired Button rendered `btn <variant class> <size class>` (no size for a text link): recorded here as the expectation.
  const variantClass = { default: 'btn-primary', secondary: 'btn-secondary', outline: 'btn-secondary', tertiary: 'btn-tertiary', destructive: 'btn-destructive' };
  for (const [variant, cls] of Object.entries(variantClass)) {
    for (const size of ['sm', 'md', 'lg']) {
      const t = tokens(html(h(Button, { variant, size }, 'x')));
      if (variant === 'tertiary') hasClasses(t, ['btn', cls], ['btn-sm', 'btn-md', 'btn-lg'], `tertiary ${size} (a text link has no box, so no size)`);
      else hasClasses(t, ['btn', cls, `btn-${size}`], [], `${variant} ${size}`);
    }
  }
  hasClasses(tokens(html(h(Button, null, 'x'))), ['btn', 'btn-primary', 'btn-md'], [], 'the default is the primary at the default size');
  assert.deepEqual(only(tokens(html(h(Button, { size: 'icon' }, 'x'))), /^btn/), ['btn-icon'], 'the icon button has no variant look');
  assert.deepEqual(only(tokens(html(h(Button, { size: 'icon-sm' }, 'x'))), /^btn/), ['btn-icon', 'btn-icon-sm']);
  assert.doesNotMatch(read('src/components/ui/button.tsx').replace(/\/\/.*$/gm, ''), /\[&_svg/, 'nothing resizes or restyles an icon inside the button');
});

test('Button link / ghost (the stock names, themed): link is the app\'s text link and takes no box; ghost + an icon size is the app\'s icon button; the caller\'s class is kept', async () => {
  const { Button } = await load('/src/components/ui/button.tsx');
  assert.deepEqual([...tokens(html(h(Button, { variant: 'link', className: 'link-inline' }, 'x')))].sort(), ['link', 'link-inline'], 'link: the .link class plus the caller\'s, no btn box');
  assert.deepEqual([...tokens(html(h(Button, { variant: 'link', size: 'lg' }, 'x')))], ['link'], 'a text link takes no size');
  assert.deepEqual([...tokens(html(h(Button, { variant: 'ghost', size: 'icon', 'aria-label': 'Close' })))], ['btn-icon'], 'ghost + icon is the 36px icon button');
  assert.deepEqual([...tokens(html(h(Button, { variant: 'ghost', size: 'icon-sm', 'aria-label': 'Close', className: 'nav-icon-btn' })))].sort(), ['btn-icon', 'btn-icon-sm', 'nav-icon-btn']);
  assert.match(html(h(Button, { variant: 'ghost', size: 'icon', 'aria-label': 'Close' })), /aria-label="Close"/);
  assert.match(read('src/components/ui/button.tsx'), /\{ "aria-label": string \} \| \{ "aria-labelledby": string \}/, 'an icon size requires an accessible name (enforced by the type)');
});

test('Button look: the primary is the accent gradient with a flat disabled fill and no glow; destructive is solid danger; sizes follow the control scale', () => {
  assert.match(rule('.btn-primary'), /bg-\[image:var\(--accent-gradient\)\]/);
  assert.match(rule('.btn-primary'), /disabled:bg-\[var\(--accent-disabled\)\]/);
  assert.doesNotMatch(rule('.btn-primary'), /shadow-/, 'no glow on any button');
  assert.match(rule('.btn-destructive'), /bg-danger-solid/);
  assert.match(rule('.btn-sm'), /fs-btn-compact/);
  assert.match(rule('.btn-tertiary'), /focus-visible:shadow-\[var\(--focus-ring\)\]/, 'a text-link button keeps its keyboard ring');
});

// ---- fields, labels, cards, checkbox -----------------------------------------------------------------------------------------------------------
test('Input and Textarea: the border state class follows error, read-only, filled, default - as the app\'s field always has', async () => {
  const { Input } = await load('/src/components/ui/input.tsx');
  const { Textarea } = await load('/src/components/ui/textarea.tsx');
  const state = (markup) => only(tokens(markup), /^form-control-/);
  assert.deepEqual(state(html(h(Input, {}))), ['form-control-default']);
  assert.deepEqual(state(html(h(Input, { value: 'x', onChange() {} }))), ['form-control-filled'], 'filled = has a value');
  assert.deepEqual(state(html(h(Input, { 'aria-invalid': 'true' }))), ['form-control-error']);
  assert.deepEqual(state(html(h(Input, { readOnly: true }))), ['form-control-readonly']);
  assert.deepEqual(state(html(h(Input, { disabled: true }))), ['form-control-default'], 'disabled keeps the default border; the disabled look is the field\'s own');
  assert.deepEqual(state(html(h(Textarea, { 'aria-invalid': 'true' }))), ['form-control-error']);
  assert.ok(tokens(html(h(Input, {}))).has('form-control'));
});

test('the app\'s composite fields draw their control with the shadcn Input and a bare Label', async () => {
  const { Input: Field } = await load('/src/components/primitives/Input.tsx');
  const root = parse(html(h(Field, { id: 'f', label: 'Full Name', value: '', error: 'Enter the name', onChange() {} })));
  const input = getByRole(root, 'textbox');
  hasClasses(tokensOf(input), ['form-control', 'form-control-error']);
  assert.equal(nameOf(input), 'Full Name');
});

test('Label and Card are look-free wrappers; Checkbox is the app\'s tile', async () => {
  const { Label } = await load('/src/components/ui/label.tsx');
  const { Card } = await load('/src/components/ui/card.tsx');
  const { Checkbox } = await load('/src/components/ui/checkbox.tsx');
  assert.equal(tokens(html(h(Label, {}))).size, 0, 'Label draws nothing of its own: the call site keeps its classes');
  assert.deepEqual([...tokens(html(h(Label, { className: 'field-label' })))], ['field-label']);
  assert.deepEqual([...tokens(html(h(Card, {})))], ['card'], 'Card is the app\'s card class and nothing else');
  hasClasses(tokens(html(h(Card, { className: 'p-3' }))), ['card', 'p-3']);
  hasClasses(tokens(html(h(Checkbox, {}))), ['checkbox', 'shrink-0']);
  assert.match(rule('.field-label'), /--fs-label[\s\S]*--field-label-disabled/, 'the label size and the disabled grey are the app\'s tokens');
  assert.match(rule(".checkbox[role='checkbox']"), /--field-checkbox-selected/, 'a Radix checkbox is filled by the app\'s checked colour');
});

test('the themed components carry no stock shadcn look: no shadow, ring, radius, size or palette utilities of their own', () => {
  for (const name of ['button', 'input', 'label', 'checkbox']) {
    const src = read(`src/components/ui/${name}.tsx`).replace(/\/\/.*$/gm, '');
    for (const stock of [/(?<![\w-])shadow-/, /(?<![\w-])ring-/, /(?<![\w-])rounded-/, /(?<![\w-])h-9(?![\w-])/, /(?<![\w-])text-sm(?![\w-])/, /(?<![\w-])bg-primary/, /(?<![\w-])border-input/, /dark:/]) {
      assert.doesNotMatch(src, stock, `${name}: ${stock}`);
    }
  }
});

test('the enterprise approval card: a card, a label that wraps the box, no stock vertical padding', async () => {
  const { Card } = await load('/src/components/ui/card.tsx');
  const { Label } = await load('/src/components/ui/label.tsx');
  const { Checkbox } = await load('/src/components/ui/checkbox.tsx');
  const root = parse(html(h(Card, { className: 'p-3' }, h(Label, { className: 'row gap-2 body-text' }, h(Checkbox, { className: 'shrink-0', checked: false }), 'Approved'))));
  hasClasses(tokensOf(all(root)[0]), ['card', 'p-3']);
  assert.ok(![...tokensOf(all(root)[0])].includes('py-4'), 'p-3 replaces the stock vertical padding');
  hasClasses(tokensOf(all(root).find((e) => e.tag === 'label')), ['row', 'gap-2', 'body-text']);
});

// ---- tabs ----------------------------------------------------------------------------------------------------------------------------------------
test('tab strips: page-level (navigation) tabs are the underline strip; the segmented frame is for filter-level tabs only; tab-strip / tab, data-state=active on the selected one', async () => {
  const { TabStrip } = await load('/src/components/primitives/TabStrip.tsx');
  const { NestedTabs } = await load('/src/components/primitives/TabLevel.tsx');
  const { Tabs } = await load('/src/components/primitives/Tabs.tsx');
  const items = [{ key: 'a', label: 'One', count: 4 }, { key: 'b', label: 'Two' }];
  for (const variant of ['navigation', 'filter']) {
    const root = parse(html(h(TabStrip, { items, active: 'a', onChange() {}, variant })));
    const list = tokensOf(getByRole(root, 'tablist'));
    hasClasses(list, ['tab-strip']);
    if (variant === 'filter') hasClasses(list, ['tab-strip-filter']); else hasClasses(list, ['tab-strip'], ['tab-strip-filter']);
    const [first, second] = byRole(root, 'tab');
    hasClasses(tokensOf(first), ['tab'], ['tab-active']);
    assert.deepEqual([first, second].map((t) => t.attrs['data-state']), ['active', 'inactive'], 'Radix marks the selected tab; no tab-active class');
    assert.ok(all(root).every((e) => !/tab-segment/.test(e.attrs.class ?? '')), 'the old tab-segment pill is gone');
    assert.ok(all(first).some((e) => tokensOf(e).has('tab-count')), 'the count is a badge');
  }
  const strip = () => h(TabStrip, { items, active: 'a', onChange() {} });
  const isFilter = (l) => tokensOf(l).has('tab-strip-filter');
  assert.equal(byRole(parse(html(h(NestedTabs, null, strip()))), 'tablist').filter((l) => tokensOf(l).has('tab-strip') && !isFilter(l)).length, 1, 'nested navigation is the same underline strip');
  const inTab = parse(html(h(Tabs, { items: [{ key: 'x', label: 'X', content: strip() }] })));
  assert.equal(byRole(inTab, 'tablist').filter((l) => tokensOf(l).has('tab-strip') && !isFilter(l)).length, 2, 'the page-level and the nested navigation strip are both the underline');
  // Underline (the default look): a rule under the tabs, the selected tab in the accent colour with a thicker underline.
  assert.match(rule('.tab-strip'), /shadow-\[inset_0_calc\(var\(--tab-line-w\)\*-1\)_0_0_var\(--tab-line-color\)\]/, 'a thin rule under the tabs');
  assert.doesNotMatch(rule('.tab-strip'), /border /, 'the navigation strip has no frame');
  assert.match(rule('.tab[data-state=active]'), /border-accent[^}]*font-bold/, 'the selected tab: accent underline, bold');
  // Segmented frame (the "Tab Strip, Filter" look): only under .tab-strip-filter.
  assert.match(rule('.tab-strip.tab-strip-filter'), /w-fit rounded-\[var\(--radius-md\)\] border border-\[var\(--field-card-border\)\]/, 'one bordered, rounded frame, only as wide as its tabs');
  assert.match(rule('.tab-strip-filter .tab'), /flex-1[^}]*border-l border-\[var\(--field-card-border\)\]/, 'equal segments divided by hairlines');
  assert.match(rule('.tab-strip-filter .tab[data-state=active]'), /bg-\[image:var\(--accent-gradient\)\] font-semibold text-accent-on/, 'the selected segment: the primary gradient, light text, semibold');
});

// ---- overlays ------------------------------------------------------------------------------------------------------------------------------------
test('the Dialog wears the app\'s overlay look: scrim, centred modal, side drawer with the slide', () => {
  const src = read('src/components/ui/dialog.tsx');
  assert.match(src, /"scrim", !drawer && "scrim-center"/);
  assert.match(src, /"modal-dialog"/);
  assert.match(src, /drawer-panel data-\[state=open\]:animate-in data-\[state=open\]:slide-in-from-right/);
  assert.match(rule('.drawer-panel'), /w-\[50vw\]/);
});


