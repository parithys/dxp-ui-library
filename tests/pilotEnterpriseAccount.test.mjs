// Phase 3 pilot, design-system half: a Card + Label + Checkbox (the Enterprise Account Creation credit-limit approval) use the themed shadcn/ui primitives.
// Pinned here: what the markup must still expose (the name, the state, the label click-through, the card shell). The screen itself is checked in the prototype.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load, close } from './harness.mjs';
import { parse, all, getByRole, stateOf } from './helpers/dom.mjs';

const h = React.createElement;
after(close);

test('pilot markup: a label that wraps a checkbox names it and exposes its state; the click-through is the label\'s (look: tests/styling.test.mjs)', async () => {
  const { Card } = await load('/src/components/ui/card.tsx');
  const { Label } = await load('/src/components/ui/label.tsx');
  const { Checkbox } = await load('/src/components/ui/checkbox.tsx');
  const view = (checked) => parse(renderToStaticMarkup(h(Card, { className: 'p-3' }, h(Label, { className: 'row gap-2 body-text' }, h(Checkbox, { className: 'shrink-0', checked }), 'Business Finance has approved this credit limit'))));
  const box = (checked) => getByRole(view(checked), 'checkbox', 'Business Finance has approved this credit limit'); // named by the wrapping label
  assert.equal(stateOf(box(false)).checked, false);
  assert.equal(stateOf(box(true)).checked, true);
  assert.equal(box(false).attrs.type, 'button', 'a button never submits a surrounding form');
  assert.equal(box(false).parent.tag, 'label', 'the control sits inside the label, so a click on the text reaches it');
  assert.ok(all(view(false)).filter((e) => e.tag === 'input').every((e) => e.attrs['aria-hidden'] === 'true'), 'Radix\'s hidden form-bridge input is aria-hidden');
});

