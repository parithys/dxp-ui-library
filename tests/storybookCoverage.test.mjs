// Every component of the library has a story: the files of src/components/ui and src/components/primitives that export a React component either
// name themselves in a story's docs `source:` (or the story imports one of their components), or carry a reasoned exclusion. The Primitives Map
// page lists every primitives file and the story it appears in; this keeps it honest.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { coverage, storyFiles } from '../scripts/storybook-coverage.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const titleOf = (f) => /(?:const meta\b[^=]*=|export default)\s*\{\s*title: '([^']+)'/.exec(read(f))?.[1];

test('every library component has a story, or an excluded reason - and exclusions are not stale', () => {
  const { map, exclusions } = coverage();
  const missing = Object.entries(map).filter(([, v]) => !v.stories.length && !v.excluded).map(([k]) => k);
  const stale = Object.keys(exclusions).filter((k) => !map[k] || map[k].stories.length);
  assert.deepEqual(missing, [], 'components with no story and no exclusion');
  assert.deepEqual(stale, [], 'exclusions that are covered now or no longer exist');
  for (const [k, reason] of Object.entries(exclusions)) assert.ok(String(reason).length > 20, `${k}: give a reason`);
});

test('every component has a story that names its own file in its docs `source` (not only one that happens to import a same-named component)', () => {
  const sources = storyFiles().filter((f) => f.endsWith('.stories.tsx')).map((f) => [...read(f).matchAll(/source:\s*(?:'([^']*)'|"([^"]*)"|`([^`]*)`)/g)].map((m) => m[1] ?? m[2] ?? m[3]).join('\n')).join('\n');
  const { map, exclusions } = coverage();
  const unnamed = Object.keys(map).filter((f) => !exclusions[f] && !sources.includes(path.basename(f)));
  assert.deepEqual(unnamed, []);
});

test('the Primitives Map lists every file of src/components/primitives, and every story it links to exists', () => {
  const map = JSON.parse(read('stories/foundations/primitivesMap.json'));
  const files = fs.readdirSync(path.join(ROOT, 'src/components/primitives'));
  assert.deepEqual(files.filter((f) => !map[f]), [], 'files with no entry in primitivesMap.json');
  assert.deepEqual(Object.keys(map).filter((f) => !files.includes(f)), [], 'entries for files that no longer exist');
  const titles = new Set(storyFiles().filter((f) => /\.stories\.tsx$/.test(f)).map(titleOf));
  const kinds = ['page', 'section', 'internal', 'helper', 'style'];
  const bad = Object.entries(map).filter(([, e]) => !kinds.includes(e.kind) || (e.story && !titles.has(e.story)) || (['page', 'section'].includes(e.kind) && !e.story)).map(([f]) => f);
  assert.deepEqual(bad, [], 'entries with an unknown kind or a story title that does not exist');
});

test('story titles are unique', () => {
  const titles = storyFiles().filter((f) => /\.stories\.tsx$/.test(f)).map(titleOf);
  assert.deepEqual(titles.filter((t, i) => titles.indexOf(t) !== i), []);
});
