// OptionToggle: a radio group, one option checked and in the Tab order, the chosen one filled.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup as html } from 'react-dom/server';
import { load, close } from './harness.mjs';

after(close);
const h = React.createElement;

test('OptionToggle: a radio group, one option checked and in the Tab order, the chosen one filled', async () => {
  const { OptionToggle } = await load('/src/components/primitives/OptionToggle.tsx');
  const out = html(h(OptionToggle, { label: 'Billing frequency', items: [{ key: 'm', label: 'Monthly · QAR 20' }, { key: 'w', label: 'Weekly · QAR 5' }, { key: 'o', label: 'One-Time · QAR 8' }], active: 'w', onChange() {} }));
  assert.match(out, /role="radiogroup" aria-label="Billing frequency"/);
  assert.equal((out.match(/role="radio"/g) ?? []).length, 3);
  assert.equal((out.match(/aria-checked="true"/g) ?? []).length, 1);
  assert.equal((out.match(/tabindex="0"/g) ?? []).length, 1);
  assert.match(out, /aria-checked="true"[^>]*class="toggle-option toggle-option-active"/);
  assert.doesNotMatch(out, /role="tab"/, 'a toggle is not tabs');
});

