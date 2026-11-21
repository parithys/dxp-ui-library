// The markup reader used by the behavioural tests: it must itself be right, or every test built on it is meaningless.
import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, all, byRole, getByRole, nameOf, stateOf, describedBy, tabbable, text } from './helpers/dom.mjs';

const doc = parse('<div><label for="n">Full Name<span aria-hidden="true"> *</span></label><input id="n" aria-required="true" aria-invalid="true" aria-describedby="n-error"/><span id="n-error" role="alert">Enter a name &amp; try again</span>'
  + '<label><button type="button" role="checkbox" aria-checked="true" disabled="">Agree</button> to terms</label><button type="button" aria-label="Close">x</button><div role="tablist" aria-label="Views"><button role="tab" aria-selected="true" tabindex="0">A<span>4</span></button><button role="tab" aria-selected="false" tabindex="-1">B</button></div><!-- c --><a>no href</a></div>');

test('names come from labels (minus an aria-hidden marker), aria-label and wrapping labels', () => {
  assert.equal(nameOf(getByRole(doc, 'textbox')), 'Full Name');
  assert.equal(nameOf(getByRole(doc, 'checkbox')), 'Agree to terms');
  assert.equal(nameOf(getByRole(doc, 'button', 'Close')), 'Close');
  assert.equal(nameOf(getByRole(doc, 'tablist')), 'Views');
});

test('state and relationships: invalid, required, disabled, checked, selected, describedby', () => {
  const input = getByRole(doc, 'textbox');
  assert.deepEqual({ invalid: stateOf(input).invalid, required: stateOf(input).required }, { invalid: true, required: true });
  assert.equal(text(describedBy(input)[0]), 'Enter a name & try again');
  assert.deepEqual({ checked: stateOf(getByRole(doc, 'checkbox')).checked, disabled: stateOf(getByRole(doc, 'checkbox')).disabled }, { checked: true, disabled: true });
  assert.deepEqual(byRole(doc, 'tab').map((t) => stateOf(t).selected), [true, false]);
});

test('keyboard reachability: roving tabindex, native disabled, an anchor without href', () => {
  assert.deepEqual(byRole(doc, 'tab').map(tabbable), [true, false]);
  assert.equal(tabbable(getByRole(doc, 'checkbox')), false);
  assert.equal(tabbable(all(doc).find((e) => e.tag === 'a')), false);
  assert.throws(() => getByRole(doc, 'tab'), /found 2/);
});

test('elements hidden from assistive technology are not found by role (an aria-hidden form-bridge input, a hidden panel)', () => {
  const d = parse('<div><input type="checkbox" aria-hidden="true" tabindex="-1"/><button type="button" role="checkbox" aria-checked="false"></button><div aria-hidden="true"><button type="button">Hidden</button></div></div>');
  assert.equal(byRole(d, 'checkbox').length, 1);
  assert.equal(byRole(d, 'button', 'Hidden').length, 0);
});
