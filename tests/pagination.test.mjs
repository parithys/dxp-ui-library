// The Pagination primitives: ONE definition of paging (page maths, summary, pager), checked against a table written by hand.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load, close } from './harness.mjs';

let P;
before(async () => { P = await load('/src/components/primitives/paginationModel.ts'); });
after(close);

test('pageWindow: pages, first and last shown, clamping, empty and infinite page sizes', () => {
  const rows = [
    // total, size, page -> page, pages, from, to
    [60, 20, 1, 1, 3, 1, 20],
    [60, 20, 3, 3, 3, 41, 60],
    [61, 20, 4, 4, 4, 61, 61],
    [0, 20, 1, 1, 1, 0, 0],
    [5, 20, 1, 1, 1, 1, 5],
    [60, 20, 9, 3, 3, 41, 60],   // a page past the end is clamped to the last
    [60, 20, 0, 1, 3, 1, 20],    // below 1 is clamped to the first
    [47, 10, 5, 5, 5, 41, 47],
    [30, Infinity, 1, 1, 1, 1, 30],
  ];
  for (const [total, size, page, wantPage, wantPages, from, to] of rows) {
    const w = P.pageWindow(total, size, page);
    assert.deepEqual([w.page, w.pages, w.from, w.to], [wantPage, wantPages, from, to], `${total}/${size}@${page}`);
  }
});

test('pageWindow conserves every item: the pages cover 1..total exactly once, whatever the size', () => {
  for (const total of [0, 1, 19, 20, 21, 60, 61, 133]) {
    for (const size of [1, 7, 8, 10, 20]) {
      const covered = [];
      const { pages } = P.pageWindow(total, size, 1);
      for (let p = 1; p <= pages; p++) { const w = P.pageWindow(total, size, p); for (let i = w.from; i <= w.to && w.from > 0; i++) covered.push(i); }
      assert.deepEqual(covered, Array.from({ length: total }, (_, i) => i + 1), `${total}/${size}`);
    }
  }
});

test('the label reads "Page a of b"', () => {
  assert.equal(P.pageLabel(2, 10), 'Page 2 of 10');
  assert.equal(P.pageLabel(1, 1), 'Page 1 of 1');
});

test('which pages the pager lists: all up to 7; otherwise the first 3, the last 3 and the current page with its neighbours, with gaps', async () => {
  const { pageItems } = await load('/src/components/primitives/pagerModel.ts');
  assert.deepEqual(pageItems(1, 3), [1, 2, 3]);
  assert.deepEqual(pageItems(4, 7), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(pageItems(1, 10), [1, 2, 3, 'gap', 8, 9, 10]);   // the attached layout
  assert.deepEqual(pageItems(5, 10), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'a gap that would hide one page shows that page');
  assert.deepEqual(pageItems(7, 12), [1, 2, 3, 'gap', 6, 7, 8, 9, 10, 11, 12]);
  assert.deepEqual(pageItems(10, 20), [1, 2, 3, 'gap', 9, 10, 11, 'gap', 18, 19, 20]);
  assert.deepEqual(pageItems(10, 10), [1, 2, 3, 'gap', 8, 9, 10]);
  assert.deepEqual(pageItems(5, 9), [1, 2, 3, 4, 5, 6, 7, 8, 9], 'a gap that would hide one page shows that page');
  // Every list ends cover first and last page, the current page is always listed, and no page appears twice or out of order.
  for (const pages of [8, 10, 25, 100]) for (let page = 1; page <= pages; page++) {
    const items = pageItems(page, pages);
    const nums = items.filter((x) => x !== 'gap');
    assert.ok(nums.includes(page) && nums.includes(1) && nums.includes(pages), `${page}/${pages}`);
    assert.deepEqual(nums, [...new Set(nums)].sort((a, b) => a - b));
    assert.notEqual(items[0], 'gap'); assert.notEqual(items.at(-1), 'gap');
  }
});

test('the Pagination bar renders nothing on one page; on several it is "Page a of b" with Previous, numbered pages, "...", Next, the current one marked', async () => {
  const React = (await import('react')).default;
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { Pagination } = await load('/src/components/primitives/Pagination.tsx');
  assert.equal(renderToStaticMarkup(React.createElement(Pagination, { page: 1, total: 20, pageSize: 20, onPage() {} })), '');
  const html = renderToStaticMarkup(React.createElement(Pagination, { page: 1, total: 100, pageSize: 10, onPage() {} }));
  assert.match(html, /Page 1 of 10/);
  assert.match(html, /aria-label="Pagination"/);
  assert.match(html, /aria-current="page"[^>]*>1</);
  assert.match(html, /aria-label="Previous page"[^>]*disabled=""/);
  assert.match(html, />\s*Previous\s*</);
  assert.match(html, />\s*Next\s*</);
  assert.match(html, />\.\.\.</);
  // No container or background of its own: the wrapper carries no border, fill, radius or padding; only the pager group is bordered.
  const wrapper = html.slice(0, html.indexOf('<span'));
  assert.doesNotMatch(wrapper, /border|bg-|rounded|px-|py-/);
  assert.match(html.slice(html.indexOf('<nav')), /button-group/, 'the pager group keeps its border');
  assert.match(fs.readFileSync('src/styles/components.css', 'utf8'), /\.button-group \{[^}]*border border-\[var\(--field-card-border\)\]/);
});

test('the current page uses the Primary button style (accent gradient, on-accent text, bold); the others are plain', async () => {
  const { Pager } = await load('/src/components/primitives/Pager.tsx');
  const React = (await import('react')).default;
  const { renderToStaticMarkup } = await import('react-dom/server');
  const html = renderToStaticMarkup(React.createElement(Pager, { page: 3, pages: 5, onPage() {} }));
  const buttons = html.match(/<button[^>]*>[^<]*(?:<svg.*?<\/svg>[^<]*)?<\/button>/g);
  const cur = html.match(/<button[^>]*aria-current="page"[^>]*>/)[0];
  assert.match(cur, /pager-current/);
  const css = fs.readFileSync('src/styles/components.css', 'utf8');
  assert.match(css, /\.pager-current \{[^}]*bg-\[image:var\(--accent-gradient\)\] text-accent-on font-bold/);
  assert.doesNotMatch(cur, /text-fg/);
  const other = html.match(/<button[^>]*aria-label="Page 2"[^>]*>/)[0];
  assert.doesNotMatch(other, /pager-current/);
  assert.ok(buttons.length >= 5);
});

test('the data table pages through the shared Pagination bar, and the Pager is used by that bar only', () => {
  assert.match(fs.readFileSync('src/components/primitives/DataTable.tsx', 'utf8'), /<Pagination /);
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${d}/${e.name}`) : /\.(ts|tsx)$/.test(e.name) ? [`${d}/${e.name}`] : []));
  const importers = walk('src').filter((f) => /from '(\.\/|[./]+\/)*(components\/)?(primitives\/)?Pager'/.test(fs.readFileSync(f, 'utf8')) && !f.endsWith('primitives/Pager.tsx'));
  assert.deepEqual(importers.sort(), ['src/components/primitives/Pagination.tsx', 'src/index.ts']);
});
