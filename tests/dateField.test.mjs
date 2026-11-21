import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { load, close } from './harness.mjs';

// The date field: typed DD/MM/YYYY or picked from the calendar its icon opens, on every date the agent enters.
let d;
before(async () => {
  d = await load('/src/lib/dateField.ts');
});
after(close);

test('parsing accepts real calendar dates only, in DD/MM/YYYY and ISO', () => {
  assert.deepEqual(d.parseDmy('30/11/2029'), { y: 2029, m: 11, d: 30 });
  assert.deepEqual(d.parseDmy('3.1.2029'), { y: 2029, m: 1, d: 3 });
  for (const bad of ['', undefined, '31/04/2029', '29/02/2027', '00/01/2029', '12/13/2029', '1/1/29', 'abc', '30112029']) assert.equal(d.parseDmy(bad), undefined, String(bad));
  assert.deepEqual(d.parseDmy('29/02/2028'), { y: 2028, m: 2, d: 29 }, 'a leap day');
  assert.deepEqual(d.parseIso('2026-11-09'), { y: 2026, m: 11, d: 9 });
  assert.deepEqual(d.parseIso('2026-11-09T10:30'), { y: 2026, m: 11, d: 9 });
  for (const bad of ['', undefined, '2026-13-01', '2026-02-30', '09/11/2026']) assert.equal(d.parseIso(bad), undefined, String(bad));
});

test('formatting round-trips, and tidying fixes the separators only', () => {
  const p = { y: 2026, m: 3, d: 7 };
  assert.equal(d.toDmy(p), '07/03/2026');
  assert.equal(d.toIso(p), '2026-03-07');
  assert.equal(d.displayDate('2026-03-07', 'iso'), '07/03/2026');
  assert.equal(d.displayDate('07/03/2026', 'dmy'), '07/03/2026');
  assert.equal(d.displayDate('', 'iso'), '');
  assert.equal(d.displayDate('not a date', 'iso'), '');
  assert.equal(d.tidyDmy('30112029'), '30/11/2029');
  assert.equal(d.tidyDmy('3-1-2029'), '03/01/2029');
  assert.equal(d.tidyDmy('hello'), 'hello');
  assert.equal(d.tidyDmy('31/04'), '31/04');
});

test('calendar arithmetic: day and month steps, clamping, range, and a whole-weeks month grid', () => {
  assert.deepEqual(d.addDays({ y: 2026, m: 12, d: 31 }, 1), { y: 2027, m: 1, d: 1 });
  assert.deepEqual(d.addDays({ y: 2026, m: 3, d: 1 }, -1), { y: 2026, m: 2, d: 28 });
  assert.deepEqual(d.addMonths({ y: 2026, m: 1, d: 31 }, 1), { y: 2026, m: 2, d: 28 }, 'clamped to the month end');
  assert.deepEqual(d.addMonths({ y: 2026, m: 1, d: 15 }, -1), { y: 2025, m: 12, d: 15 });
  assert.deepEqual(d.addMonths({ y: 2026, m: 11, d: 15 }, 14), { y: 2028, m: 1, d: 15 });
  const min = { y: 2026, m: 11, d: 10 }, max = { y: 2026, m: 11, d: 20 };
  assert.ok(d.inRange({ y: 2026, m: 11, d: 10 }, min, max) && d.inRange({ y: 2026, m: 11, d: 20 }, min, max));
  assert.ok(!d.inRange({ y: 2026, m: 11, d: 9 }, min, max) && !d.inRange({ y: 2026, m: 11, d: 21 }, min, max));
  assert.ok(d.inRange({ y: 1999, m: 1, d: 1 }), 'no bounds: anything');
  for (const [y, m] of [[2026, 11], [2026, 2], [2028, 2], [2026, 3]]) {
    const grid = d.monthGrid(y, m);
    assert.equal(grid.length % 7, 0, `${y}-${m}: whole weeks`);
    assert.equal(grid.filter((c) => c.m === m).length, d.daysInMonth(y, m), `${y}-${m}: every day of the month once`);
    assert.equal(new Date(grid[0].y, grid[0].m - 1, grid[0].d).getDay(), 6, 'the week starts on Saturday');
  }
});

test('the DateInput renders the typed date and the calendar icon button, for both storage formats, and disables the icon on a locked field', async () => {
  const React = (await import('react')).default;
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { DateInput } = await load('/src/components/primitives/DateInput.tsx');
  const html = (props) => renderToStaticMarkup(React.createElement(DateInput, { label: 'Expiry Date', onChange: () => {}, ...props }));
  const iso = html({ format: 'iso', value: '2026-11-09' });
  assert.match(iso, /value="09\/11\/2026"/, 'an ISO value is shown as DD/MM/YYYY');
  assert.match(iso, /aria-label="Choose date"/);
  const dmy = html({ value: '30/11/2029' });
  assert.match(dmy, /value="30\/11\/2029"/);
  assert.match(dmy, /aria-label="Choose date"/);
  assert.doesNotMatch(dmy, /role="dialog"/, 'the calendar opens from the icon');
  assert.match(html({ value: '', readOnly: true }), /aria-label="Choose date"[^>]*disabled|disabled[^>]*aria-label="Choose date"/, 'a locked field cannot open it');
});

test('every empty DateInput shows the DD/MM/YYYY watermark; a filled one shows the date instead; a required one has no clear button, an optional filled one does', async () => {
  const React = (await import('react')).default;
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { DateInput } = await load('/src/components/primitives/DateInput.tsx');
  const html = (props) => renderToStaticMarkup(React.createElement(DateInput, { label: 'Expiry Date', onChange: () => {}, ...props }));
  for (const format of ['dmy', 'iso']) {
    const empty = html({ format, value: '' });
    assert.match(empty, /placeholder="DD\/MM\/YYYY"/, `${format}: the empty field names its format`);
    assert.doesNotMatch(empty, /aria-label="Clear date"/, 'nothing to clear');
  }
  assert.match(html({ format: 'iso', value: '2026-11-09' }), /value="09\/11\/2026"/);
  assert.match(html({ format: 'iso', value: '2026-11-09' }), /aria-label="Clear date"/, 'an optional filled date can be cleared');
  assert.doesNotMatch(html({ format: 'iso', value: '2026-11-09', required: true }), /aria-label="Clear date"/, 'a required date is replaced, not emptied');
  assert.doesNotMatch(html({ format: 'iso', value: '2026-11-09', readOnly: true }), /aria-label="Clear date"/, 'a locked date is not cleared');
  assert.match(html({ value: '31/02/2026' }), /Enter a valid date\./, 'a complete date that does not exist is refused');
  assert.match(html({ value: '01/01/2020', min: '01/01/2021' }), /Enter a date on or after 01\/01\/2021\./);
  assert.match(html({ value: '01/01/2030', max: '01/01/2029' }), /Enter a date on or before 01\/01\/2029\./);
  assert.match(html({ value: '02/01/2026', isDateDisabled: (d) => d === '02/01/2026' }), /This date is not available\./);
  assert.doesNotMatch(html({ value: '02/01/2026', error: 'Custom.', min: '01/01/2030' }), /on or after/, 'the caller\'s own message wins');
});

// Every editable date in the app is the DateInput (a typed field with the calendar icon): no raw date input is left behind.
test('no editable date uses a bare native date input or a plain text field labelled as a date', () => {
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : /\.tsx$/.test(e.name) ? [path.join(dir, e.name)] : []));
  const offenders = [];
  for (const file of walk('src')) {
    if (file.endsWith('primitives/DateInput.tsx')) continue; // the field itself wraps the text Input
    const src = fs.readFileSync(file, 'utf8');
    if (/type="date"/.test(src)) offenders.push(`${file}: type="date"`);
    if (/type="(datetime-local|month|week)"/.test(src)) offenders.push(`${file}: a native date-time picker`);
    if (/<Input[^>]*placeholder="DD\/MM\/YYYY"/.test(src)) offenders.push(`${file}: a DD/MM/YYYY text Input`);
  }
  assert.deepEqual(offenders, []);
  const input = fs.readFileSync('src/components/primitives/DateInput.tsx', 'utf8');
  assert.match(input, /aria-label="Choose date"/, 'the calendar icon button is named');
  assert.match(input, /onChange=\{typeIn\}/, 'the date can be typed');
});
