// Phase 5: the specialised components the shadcn/ui migration must not replace (docs/migration/phase5-specialised-components.md) - what each does
// today, pinned without a browser (the browser half is e2e/protected.spec.ts) - and the repository rules that keep them from being replaced by accident.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load, close } from './harness.mjs';

const h = React.createElement;
const html = renderToStaticMarkup;
const read = (f) => fs.readFileSync(f, 'utf8');
after(close);

const walk = (d, out = []) => {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(p)) out.push(p.split(path.sep).join('/'));
  }
  return out;
};

// ---- the protected set -----------------------------------------------------------------------------------------------------------------------
// The library owns the protected design-system components; the prototype owns QidInput, the notification slice and the ToastContainer
// (dxp-ui-library's consumer: prototype/tests/protectedComponents.test.mjs), and checks that none of these is re-implemented there.
const PROTECTED = {
  'src/components/primitives/Select.tsx': 'Select',
  'src/components/primitives/PhoneNumberInput.tsx': 'PhoneNumberInput',
  'src/components/primitives/SignaturePad.tsx': 'SignaturePad',
  'src/components/primitives/DataTable.tsx': 'DataTable',
  'src/components/primitives/Tooltip.tsx': 'Tooltip',
};

test('every protected component carries its PROTECTED marker, so replacing one is a deliberate act with a paper trail', () => {
  for (const f of Object.keys(PROTECTED)) {
    assert.match(read(f), /PROTECTED \(docs\/migration\/phase5-specialised-components\.md\)/, f);
  }
});

// ---- searchable select ------------------------------------------------------------------------------------------------------------------------
test('Select: every dropdown in the app is this searchable combobox - the field takes the typing, the list narrows, choosing a row is what changes the value', async () => {
  const { Select } = await load('/src/components/primitives/Select.tsx');
  const out = html(h(Select, { label: 'Plan', options: [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }], value: 'b', onChange() {}, required: true }));
  assert.match(out, /role="combobox"/);
  assert.match(out, /aria-autocomplete="list"/);
  assert.match(out, /aria-expanded="false"/);
  assert.match(out, /aria-required="true"/);
  assert.match(out, /value="Beta"/, 'closed, the field shows the chosen label');
  assert.doesNotMatch(out, /role="listbox"/, 'the list renders only while open');
  assert.match(out, /<label[^>]* for=/, 'the label is tied to the field');
  const err = html(h(Select, { label: 'Plan', options: [], value: '', error: 'Choose one', onChange() {} }));
  assert.match(err, /aria-invalid="true"/);
  assert.match(err, /role="alert"/);
  const src = read('src/components/primitives/Select.tsx');
  assert.match(src, /onChange\?\.\(\{ target: \{ value: optionValue \} \} as ChangeEvent<HTMLSelectElement>\)/, 'callers keep reading e.target.value');
  assert.match(src, /o\.label\.toLowerCase\(\)\.includes\(/, 'the list is filtered by what was typed');
  for (const key of ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Enter', 'Escape', 'Tab']) assert.match(src, new RegExp(`'${key}'`), key);
  assert.match(src, /aria-activedescendant/);
  assert.match(src, /e\.stopPropagation\(\);\n\s+close\(true\)/, 'Escape closes the list only, not the dialog the field sits in');
});

// ---- PhoneNumberInput ------------------------------------------------------------------------------------------------------------------------
test('PhoneNumberInput: a stored E.164 value split into a country combobox and the national digits, digits only, capped, with its Qatar display rule', async () => {
  const { PhoneNumberInput } = await load('/src/components/primitives/PhoneNumberInput.tsx');
  const { formatQatarPhoneForDisplay } = await load('/src/components/primitives/phoneFormat.ts');
  const { countryFromNumber, isQatarMobileLocalNumber, isQatarLandlineLocalNumber } = await load('/src/components/primitives/countryDialCodes.ts');
  assert.equal(formatQatarPhoneForDisplay('+97450350824'), '+974 50350824');
  assert.equal(formatQatarPhoneForDisplay('+97450350'), '+97450350', 'an incomplete number is shown as stored');
  assert.equal(formatQatarPhoneForDisplay('+14155550100'), '+14155550100', 'another country is untouched');
  assert.equal(countryFromNumber('+97450350824')?.iso, 'QA', 'longest dial-code prefix wins');
  assert.equal(countryFromNumber('50350824'), undefined, 'a bare local number is not coerced');
  assert.ok(isQatarMobileLocalNumber('50350824') && !isQatarMobileLocalNumber('40350824'));
  assert.ok(isQatarLandlineLocalNumber('44350824') && !isQatarLandlineLocalNumber('50350824'));
  const free = html(h(PhoneNumberInput, { label: 'Mobile', value: '+97450350824', onChange() {} }));
  assert.match(free, /inputMode="tel"/);
  assert.match(free, /role="combobox"/);
  assert.match(free, /aria-label="Country calling code, currently Qatar \+974"/);
  const pinned = html(h(PhoneNumberInput, { label: 'Alt', value: '', onChange() {}, fixedIso: 'QA' }));
  assert.doesNotMatch(pinned, /role="combobox"/, 'a field fixed to one country offers no picker');
  const src = read('src/components/primitives/PhoneNumberInput.tsx');
  assert.match(src, /replace\(\/\\D\/g, ''\)\.slice\(0, maxNational\)/, 'digits only, capped at the national maximum');
  assert.match(src, /15 - \(country\.dial\.length - 1\)/, 'the E.164 ceiling');
});

// ---- SignaturePad ----------------------------------------------------------------------------------------------------------------------------
test('SignaturePad: a 480x160 pointer-driven canvas; Clear and Done need ink; a disabled pad is inert; the ink colour is a token (never the theme)', async () => {
  const { SignaturePad } = await load('/src/components/primitives/SignaturePad.tsx');
  const out = html(h(SignaturePad, { onDone() {} }));
  assert.match(out, /<canvas[^>]*width="480"[^>]*height="160"/);
  assert.match(out, /disabled=""[^>]*>Clear</);
  assert.match(out, /disabled=""[^>]*>Done</);
  assert.doesNotMatch(out, />Cancel</);
  assert.match(html(h(SignaturePad, { onDone() {}, onCancel() {}, doneLabel: 'Save' })), />Cancel<[\s\S]*>Save</);
  const off = html(h(SignaturePad, { onDone() {}, disabled: true }));
  assert.match(off, /aria-disabled="true"/);
  assert.match(off, /cursor-not-allowed/);
  const src = read('src/components/primitives/SignaturePad.tsx');
  for (const ev of ['onPointerDown', 'onPointerMove', 'onPointerUp', 'onPointerLeave']) assert.match(src, new RegExp(ev));
  assert.match(src, /toDataURL\(\)/, 'the export is the canvas data URL');
  assert.match(src, /--signature-ink/);
});

// ---- DataTable -------------------------------------------------------------------------------------------------------------------------------
test('DataTable: sortable headers with aria-sort, paging above the page size, the empty and loading states, row and cell links', async () => {
  const { DataTable } = await load('/src/components/primitives/DataTable.tsx');
  const columns = [{ key: 'id', header: 'Order', strong: true }, { key: 'amt', header: 'Amount', numeric: true }, { key: 'act', header: '', sortable: false }];
  const rows = Array.from({ length: 12 }, (_, i) => ({ id: `R${i}`, amt: i * 10 }));
  const out = html(h(DataTable, { columns, rows, rowKey: (r) => r.id, pageSize: 5 }));
  assert.match(out, /<table/);
  assert.equal((out.match(/aria-sort="none"/g) ?? []).length, 2, 'the two sortable headers; the action column is not sortable');
  assert.equal((out.match(/<tr/g) ?? []).length, 1 + 5, 'a header row and one page of rows');
  assert.match(out, /aria-label="Pagination"/);
  const all = html(h(DataTable, { columns, rows, rowKey: (r) => r.id, pageSize: Infinity }));
  assert.equal((all.match(/<tr/g) ?? []).length, 1 + 12);
  assert.doesNotMatch(all, /aria-label="Pagination"/, 'Infinity shows every row, no pager');
  assert.match(html(h(DataTable, { columns, rows: [], rowKey: (r) => r.id, emptyMessage: 'Nothing here' })), /Nothing here/);
  const src = read('src/components/primitives/DataTable.tsx');
  assert.match(src, /localeCompare\(String\(b\), undefined, \{ numeric: true, sensitivity: 'base' \}\)/, 'natural-order sort');
  assert.match(src, /if \(prev\.direction === 'asc'\) return \{ key: col\.key, direction: 'desc' \};\n\s+return null;/, 'asc, desc, then unsorted');
});

// ---- tooltip system --------------------------------------------------------------------------------------------------------------------------
test('Tooltip: one portalled hover-and-focus tooltip with a group that skips the delay; non-interactive triggers become focusable', () => {
  const src = read('src/components/primitives/Tooltip.tsx');
  assert.match(src, /createPortal/);
  assert.match(src, /role="tooltip"/);
  assert.match(src, /aria-describedby/);
  assert.match(src, /Escape/);
  assert.match(src, /NON_INTERACTIVE_TAGS/);
  assert.match(read('src/components/primitives/TooltipContext.tsx'), /--tooltip-group-window/);
});

// ---- what Phase 4 did to the protected components -------------------------------------------------------------------------------------------
test('Phase 4 only let SignaturePad consume the migrated Button; the other protected components compose no shadcn primitive', () => {
  assert.match(read('src/components/primitives/SignaturePad.tsx'), /import \{ Button \} from '\.\.\/ui\/button'/);
  for (const f of ['src/components/primitives/Select.tsx', 'src/components/primitives/PhoneNumberInput.tsx', 'src/components/primitives/DataTable.tsx', 'src/components/primitives/Tooltip.tsx']) {
    assert.doesNotMatch(read(f), /\.\.\/ui\//, `${f} composes no shadcn primitive`);
  }
});

// ---- governance: no second system ----------------------------------------------------------------------------------------------------------
const OUTSIDE_UI = () => walk('src').filter((f) => !f.startsWith('src/components/ui/'));
const NOT_BARREL = (f) => f !== 'src/index.ts'; // the barrel re-exports the stock Dropdown Menu for consumers; the app must not use it (prototype test)

test('governance: no shadcn Select, Tooltip, Toast/Sonner or Dropdown is imported by the library, the Dialog only by Modal and Drawer and the Tabs only by TabStrip (each has a protected or unmigrated counterpart)', () => {
  const banned = /from ['"](?:@\/|(?:\.\.?\/)+)(?:components\/)?ui\/(select|tooltip|sonner|toast|dropdown-menu|table|command|combobox|popover)['"]/;
  assert.deepEqual(OUTSIDE_UI().filter((f) => NOT_BARREL(f) && banned.test(read(f))), []);
});

test('governance: one tooltip system, one table, one signature canvas in the library', () => {
  const files = OUTSIDE_UI();
  const offenders = (re) => files.filter((f) => re.test(read(f)));
  assert.deepEqual(offenders(/from ['"]sonner['"]|<Toaster\b|@radix-ui\/react-toast/), [], 'no second toast system');
  assert.deepEqual(offenders(/<TooltipProvider\b|@radix-ui\/react-tooltip|from ['"]radix-ui['"][^;]*Tooltip/), [], 'no second tooltip provider');
  assert.deepEqual(offenders(/@tanstack\/react-table/), [], 'no second table engine');
  assert.ok(!fs.existsSync('src/components/ui/table.tsx'), 'no shadcn Table beside DataTable');
  assert.deepEqual(files.filter((f) => /<canvas\b/.test(read(f))), ['src/components/primitives/SignaturePad.tsx'], 'one canvas: the signature pad');
});

test('governance: the shadcn components that remain installed are the ones with a place in the migration', () => {
  assert.deepEqual(fs.readdirSync('src/components/ui').map((f) => f.replace(/\.tsx$/, '')).sort(), ['button', 'card', 'checkbox', 'dialog', 'dropdown-menu', 'input', 'label', 'tabs', 'textarea']);
});

test('the tooltip reads its pixel tokens with a numeric fallback, so an expression-valued token never leaves it without a position', () => {
  const t = read('src/components/primitives/Tooltip.tsx');
  assert.match(t, /function pxToken/);
  assert.doesNotMatch(t, /parseInt\(getComputedStyle\(document\.documentElement\)\.getPropertyValue\('--tooltip-(offset|max-width)'\)/);
});
