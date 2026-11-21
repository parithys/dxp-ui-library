// Touch keyboards of the library's field components: the phone composites open the phone keypad, search boxes return with "Search", and the shared
// Input asks for the number pad for a number field. (The app's per-field keyboard expectations are in prototype/tests/fieldKeyboards.test.mjs.)
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load, close } from './harness.mjs';

after(close);
const read = (f) => fs.readFileSync(f, 'utf8');

test('the phone composite opens the phone keypad; search boxes return with "Search"', () => {
  assert.match(read('src/components/primitives/PhoneNumberInput.tsx'), /inputMode="tel"/);
  assert.match(read('src/components/primitives/SearchField.tsx'), /enterKeyHint="search"/);
});

test('the shared Input asks for the number pad for a number field (decimal when fractions are allowed)', async () => {
  const React = (await import('react')).default;
  const { renderToStaticMarkup: html } = await import('react-dom/server');
  const { Input } = await load('/src/components/primitives/Input.tsx');
  assert.match(html(React.createElement(Input, { label: 'Age', type: 'number', value: '', onChange() {} })), /inputMode="numeric"/);
  assert.match(html(React.createElement(Input, { label: 'Amount', type: 'number', step: 'any', value: '', onChange() {} })), /inputMode="decimal"/);
  assert.doesNotMatch(html(React.createElement(Input, { label: 'First Name', value: '', onChange() {} })), /inputMode=/, 'text keeps the full keyboard');
});

test('the phone field keeps a masked display value intact while it is edited', () => {
  assert.match(read('src/components/primitives/PhoneNumberInput.tsx'), /maskedDisplay && e\.target\.value\.includes\('\*'\)/);
});

test('A number input gets the numeric keypad from the Input primitive (decimal when fractions are allowed)', async () => {
  const React = (await import('react')).default;
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { Input } = await load('/src/components/primitives/Input.tsx');
  const html = (props) => renderToStaticMarkup(React.createElement(Input, props));
  assert.match(html({ type: 'number' }), /inputmode="numeric"/i);
  assert.match(html({ type: 'number', step: '0.5' }), /inputmode="decimal"/i);
  assert.doesNotMatch(html({ type: 'text' }), /inputmode/i);
  assert.match(html({ type: 'text', inputMode: 'tel' }), /inputmode="tel"/i);
});
