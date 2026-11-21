// Empty State: one component draws every empty list; the data table uses it.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load, close } from './harness.mjs';

after(close);

test('Empty State: one component draws every empty list; the data table uses it', async () => {
  const React = (await import('react')).default;
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { EmptyState } = await load('/src/components/primitives/EmptyState.tsx');
  const out = renderToStaticMarkup(React.createElement(EmptyState, { title: 'No Orders', message: 'Nothing here.', action: React.createElement('button', { type: 'button' }, 'Go') }));
  assert.match(out, /role="status"/);
  assert.match(out, /No Orders/);
  assert.match(out, /Nothing here\./);
  assert.match(out, /<button type="button">Go<\/button>/);
  assert.match(fs.readFileSync('src/components/primitives/DataTable.tsx', 'utf8'), /<EmptyState\b/, 'DataTable draws its own empty state');
});
