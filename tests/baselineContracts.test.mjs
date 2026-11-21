// The behavioural BASELINE for the design system (Phase 2 of the shadcn/ui migration): characterisation tests that pin what the library's components,
// tokens and device rules do today, so a later change shows up as a failing assertion instead of a silent one. The application's own baseline
// (leave-journey guard, validation, page-level accessibility, empty/error states) is in prototype/tests/baselineContracts.test.mjs.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load, close } from './harness.mjs';
import { parse, all, byRole, getByRole, nameOf, stateOf, describedBy, tabbable, text } from './helpers/dom.mjs';

const h = React.createElement;
const read = (f) => fs.readFileSync(f, 'utf8');
const html = renderToStaticMarkup;
after(close);

let deviceType;
before(async () => {
  deviceType = await load('/src/lib/deviceType.ts');
});

test('Button (Phase 4: the shadcn Button replaced primitives/Button): a native button, type=button by default, inert when disabled (native disabled only, no aria-disabled)', async () => {
  const { Button } = await load('/src/components/ui/button.tsx');
  const btn = getByRole(parse(html(h(Button, null, 'Go'))), 'button', 'Go');
  assert.equal(btn.attrs.type, 'button');
  const off = getByRole(parse(html(h(Button, { disabled: true }, 'Go'))), 'button', 'Go');
  assert.equal(stateOf(off).disabled, true);
  assert.ok('disabled' in off.attrs, 'native disabled');
  assert.equal(off.attrs['aria-disabled'], undefined);
  assert.equal(getByRole(parse(html(h(Button, { variant: 'tertiary' }, 'Go'))), 'button', 'Go').attrs.type, 'button', 'a text-link button is still a button');
});

test('Input: the label is tied to the field; an error sets aria-invalid, is announced (role=alert) and is what aria-describedby names; helper text is described the same way', async () => {
  const { Input } = await load('/src/components/primitives/Input.tsx');
  const field = (props) => getByRole(parse(html(h(Input, { id: 'f', label: 'Full Name', value: '', onChange() {}, ...props }))), 'textbox');
  const ok = field({});
  assert.equal(nameOf(ok), 'Full Name', 'the visible label is the field\'s name');
  assert.equal(stateOf(ok).invalid, false);
  const err = field({ error: 'Enter the name' });
  assert.equal(stateOf(err).invalid, true);
  const [msg] = describedBy(err);
  assert.equal(text(msg), 'Enter the name', 'aria-describedby names the error');
  assert.equal(msg.attrs.role, 'alert', 'and it is announced');
  const helper = field({ helperText: 'As on the ID' });
  assert.equal(text(describedBy(helper)[0]), 'As on the ID');
  assert.equal(stateOf(helper).invalid, false);
  const ro = field({ value: 'v', readOnly: true });
  assert.equal(stateOf(ro).readOnly, true);
  assert.equal(tabbable(ro), false, 'a read-only field leaves the tab order (it keeps its role, name and value for assistive technology)');
});

test('Input: a placeholder passed to the app\'s Input is dropped (labels only); required fields carry aria-required with the marker aria-hidden', async () => {
  const { Input } = await load('/src/components/primitives/Input.tsx');
  const hinted = getByRole(parse(html(h(Input, { label: 'A', value: '', placeholder: 'hint', onChange() {} }))), 'textbox');
  assert.equal(hinted.attrs.placeholder, undefined);
  const root = parse(html(h(Input, { label: 'A', value: '', required: true, onChange() {} })));
  const req = getByRole(root, 'textbox');
  assert.equal(stateOf(req).required, true);
  assert.equal(nameOf(req), 'A', 'the asterisk is not part of the name');
  assert.ok(all(root).some((e) => e.attrs['aria-hidden'] === 'true' && text(e) === '*'), 'the visible marker is hidden from assistive technology');
});

test('Select (the searchable combobox): role=combobox with aria-haspopup=listbox, aria-expanded, aria-autocomplete=list; the list is not referenced while closed', async () => {
  const { Select } = await load('/src/components/primitives/Select.tsx');
  const out = html(h(Select, { label: 'Reason', options: [{ value: 'a', label: 'Alpha' }], value: '', onChange() {} }));
  assert.match(out, /role="combobox"/);
  assert.match(out, /aria-haspopup="listbox"/);
  assert.match(out, /aria-expanded="false"/);
  assert.match(out, /aria-autocomplete="list"/);
  assert.doesNotMatch(out, /aria-controls/, 'no aria-controls until open');
  const src = read('src/components/primitives/Select.tsx');
  assert.match(src, /role="listbox"/);
  assert.match(src, /role="option"/);
  assert.match(src, /aria-activedescendant/, 'focus stays on the field; the highlighted option is named by aria-activedescendant');
  assert.match(src, /e\.key === 'ArrowDown' \|\| e\.key === 'ArrowUp' \|\| e\.key === 'Enter'/);
  assert.match(src, /case 'Escape':[\s\S]{0,200}Closes the list only/, 'Escape closes the list, not the dialog the field sits in');
});

test('TabStrip (Phase 7: the Radix Tabs replaced the hand-written strip): a named tablist of tabs with aria-selected; keys and roving tabindex are Radix\'s (e2e/tabs.spec.ts)', async () => {
  const { TabStrip } = await load('/src/components/primitives/TabStrip.tsx');
  const root = parse(html(h(TabStrip, { label: 'Views', items: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }], active: 'a', onChange() {} })));
  assert.equal(nameOf(getByRole(root, 'tablist')), 'Views');
  assert.deepEqual(byRole(root, 'tab').map((t) => [nameOf(t), stateOf(t).selected]), [['A', true], ['B', false]]);
  assert.match(read('src/components/primitives/TabStrip.tsx'), /from '\.\.\/ui\/tabs'/);
  assert.doesNotMatch(read('src/components/primitives/TabStrip.tsx'), /onKeyDown/, 'no hand-written key handler');
});

test('Checkbox (Phase 4: the shadcn/Radix checkbox replaced the native input): role=checkbox with an exposed checked state, a native disabled button, named by aria-label, no native input beside it', async () => {
  const { Checkbox } = await load('/src/components/ui/checkbox.tsx');
  const box = (props) => parse(html(h(Checkbox, { 'aria-label': 'Agree', ...props })));
  const on = getByRole(box({ defaultChecked: true }), 'checkbox', 'Agree');
  assert.equal(stateOf(on).checked, true);
  assert.equal(on.tag, 'button');
  assert.equal(on.attrs.type, 'button', 'never submits a surrounding form');
  assert.equal(stateOf(getByRole(box({}), 'checkbox', 'Agree')).checked, false);
  const off = getByRole(box({ disabled: true }), 'checkbox', 'Agree');
  assert.equal(stateOf(off).disabled, true);
  assert.equal(tabbable(off), false);
  // Server markup carries Radix's hidden form-bridge input; it is aria-hidden and out of the tab order, and in the browser it exists only inside a <form> (none of the screens that use the Checkbox has one).
  assert.ok(all(box({ defaultChecked: true })).filter((e) => e.tag === 'input').every((e) => e.attrs['aria-hidden'] === 'true' && !tabbable(e)), 'no visible native input beside it');
  assert.ok(all(box({ defaultChecked: true })).some((e) => e.tag === 'svg' && e.attrs['aria-hidden'] === 'true'), 'the tick is decorative');
});

test('overlay contract after Phase 6: role=dialog from Radix, named by aria-labelledby, container focus, opener focus return; a Modal closes on the scrim, a Drawer does not', () => {
  const dialog = read('src/components/ui/dialog.tsx');
  assert.match(dialog, /ref\.current\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(dialog, /back\.focus\(\{ preventScroll: true \}\)/);
  assert.match(dialog, /if \(drawer\) e\.preventDefault\(\)/);
  assert.match(read('src/components/primitives/Modal.tsx'), /<DialogTitle className="title title-xl">/);
  assert.match(read('src/components/primitives/Drawer.tsx'), /<DialogContent variant="drawer">/);
});

test('device baseline: touch points or a coarse pointer make a "tablet" (the phone counts as one); ?device=tablet|web forces it for review', () => {
  assert.equal(deviceType.deviceTypeFrom({ maxTouchPoints: 0, coarsePointer: false }), 'web');
  assert.equal(deviceType.deviceTypeFrom({ maxTouchPoints: 5 }), 'tablet');
  assert.equal(deviceType.deviceTypeFrom({ coarsePointer: true }), 'tablet');
  assert.match(read('src/lib/deviceType.ts'), /get\('device'\)[\s\S]*sessionStorage\.setItem\('dxp-device'/);
});

test('tablet baseline: the control heights scale on [data-device=tablet] (2rem/2.625rem/3rem -> 2.75rem/3rem/3.5rem) and the touch target is 2.75rem', () => {
  const tokens = read('src/styles/tokens.css');
  assert.match(tokens, /--control-h-sm: 2rem;\s*--control-h-md: 2\.625rem;\s*--control-h-lg: 3rem;/);
  assert.match(tokens, /--touch-target: 2\.75rem;/);
  assert.match(tokens, /--field-height: var\(--control-h-md\);/);
  assert.match(tokens, /\[data-device='tablet'\] \{\s*--control-h-sm: 2\.75rem;\s*--control-h-md: 3rem;\s*--control-h-lg: 3\.5rem;/);
});

test('responsive baseline: Tailwind\'s default breakpoints (no custom --breakpoint-*); useMinWidth reads a min-width media query', () => {
  assert.doesNotMatch(read('src/styles/preset.css') + read('src/styles/tokens.css'), /--breakpoint-/);
  assert.match(read('src/hooks/useMinWidth.ts'), /\(min-width: \$\{px\}px\)/);
});

test('dark-theme baseline: focus is the teal --color-field-border-focus (#007e91) in light and the foreground colour in dark; the field edge is #878787 in light and #707a8e in dark (Phase 7 raised it from the card-border token, 1.6:1, to 3:1 or more)', () => {
  const tokens = read('src/styles/tokens.css');
  assert.match(tokens, /--color-field-border-focus: #007e91;/);
  assert.match(tokens, /--color-field-border-focus: var\(--fg\);/, 'dark: the focus colour is the foreground, not teal');
  assert.match(tokens, /--focus-ring: 0 0 0 2px var\(--bg\), 0 0 0 4px var\(--focus-outline\);/);
  assert.match(tokens, /--field-border: #878787;/);
  // dark: the field edge was --field-card-border (a 22% mix of --nav-fg into --nav-bg: 1.61:1 on the card, 1.77:1 on the page - below WCAG 1.4.11's 3:1, a
  // recorded gap). Phase 7 (approved) set it to #707a8e, which e2e/a11y.spec.ts measures at 3:1 or more on the real surfaces. The card border itself is unchanged.
  assert.match(tokens, /--field-border: #707a8e;\s*\n\s*--field-border-disabled: var\(--border-soft\)/);
  assert.match(tokens, /--field-card-border: var\(--border\);/);
  assert.match(tokens, /--border: color-mix\(in oklab, var\(--nav-bg\), var\(--nav-fg\) 22%\);/);
});
