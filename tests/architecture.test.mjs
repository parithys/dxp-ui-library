// Architecture guards for the library, computed from the source's own import graph (value imports only - `import type` is erased).
//
// Layers (an arrow means "may import"): assets / lib  <-  components/ui  <-  components/primitives; hooks import lib only.
// What is enforced: no import cycles; the library is self-contained (relative imports only: no '@/' alias, nothing from an application);
// assets are a leaf; lib imports nothing else in the library; ui (the shadcn components) never imports primitives; icon paths live in
// src/assets/icons. The application's layers are enforced in prototype/tests/architecture.test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'src');

const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(p)) files.push(p);
  }
})(SRC);

const EXTS = ['.ts', '.tsx', '/index.ts', '/index.tsx'];
function resolve(from, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(from), spec);
  for (const e of ['', ...EXTS]) {
    const p = base + e;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
const graph = new Map();
for (const f of files) {
  const text = strip(fs.readFileSync(f, 'utf8'));
  const deps = new Set();
  for (const m of text.matchAll(/(?:^|\n)\s*(import|export)\s+(type\s+)?([^'";]*?)\s*from\s*['"]([^'"]+)['"]/g)) {
    if (m[2]) continue; // import type / export type
    // `import { type A, type B }` with nothing else is also erased
    const clause = m[3];
    if (/^\{[^}]*\}$/.test(clause.trim())) {
      const names = clause.trim().slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
      if (names.length && names.every((n) => n.startsWith('type '))) continue;
    }
    const r = resolve(f, m[4]);
    if (r) deps.add(r);
  }
  for (const m of text.matchAll(/(?:^|\n)\s*import\s*['"]([^'"]+)['"]/g)) {
    const r = resolve(f, m[1]);
    if (r) deps.add(r);
  }
  graph.set(f, deps);
}

const rel = (p) => path.relative(SRC, p);
const area = (p) => {
  const r = rel(p).split(path.sep);
  if (r[0] === 'components') return r[1] === 'ui' ? 'ui' : 'primitives';
  return r[0];
};

test('architecture: there are no import cycles', () => {
  // Tarjan's strongly connected components.
  let index = 0;
  const stack = [];
  const idx = new Map();
  const low = new Map();
  const on = new Set();
  const cycles = [];
  const visit = (v) => {
    idx.set(v, index);
    low.set(v, index);
    index++;
    stack.push(v);
    on.add(v);
    for (const w of graph.get(v) ?? []) {
      if (!graph.has(w)) continue;
      if (!idx.has(w)) {
        visit(w);
        low.set(v, Math.min(low.get(v), low.get(w)));
      } else if (on.has(w)) low.set(v, Math.min(low.get(v), idx.get(w)));
    }
    if (low.get(v) === idx.get(v)) {
      const comp = [];
      let w;
      do {
        w = stack.pop();
        on.delete(w);
        comp.push(w);
      } while (w !== v);
      if (comp.length > 1) cycles.push(comp.map(rel).sort());
    }
  };
  for (const v of graph.keys()) if (!idx.has(v)) visit(v);
  assert.deepEqual(cycles, []);
});

const FORBIDDEN = {
  ui: ['primitives', 'hooks'],
  lib: ['ui', 'primitives', 'hooks', 'assets', 'styles'],
  hooks: ['ui', 'primitives', 'assets'],
  // The shared asset library (icons) is a leaf: it imports nothing else in the library.
  assets: ['ui', 'primitives', 'lib', 'hooks', 'styles'],
};

test('architecture: layers only import downward', () => {
  const bad = [];
  for (const [file, deps] of graph) {
    const from = area(file);
    const banned = FORBIDDEN[from];
    if (!banned) continue;
    for (const dep of deps) {
      const to = area(dep);
      if (to !== from && banned.includes(to)) bad.push(`${rel(file)} -> ${rel(dep)}`);
    }
  }
  assert.deepEqual(bad.sort(), []);
});

test('architecture: the library is self-contained - relative imports and declared packages only, no "@/" alias, no application path', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(SRC, '..', 'package.json'), 'utf8'));
  const declared = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]);
  const bad = [];
  for (const f of files) {
    for (const m of strip(fs.readFileSync(f, 'utf8')).matchAll(/(?:^|\n)\s*(?:import|export)\s+(?:type\s+)?[^'";]*?\s*from\s*['"]([^'"]+)['"]|(?:^|\n)\s*import\s*['"]([^'"]+)['"]/g)) {
      const spec = m[1] ?? m[2];
      if (spec.startsWith('.')) continue;
      const name = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
      if (!declared.has(name) && !/^react(-dom)?$/.test(name)) bad.push(`${rel(f)}: ${spec}`);
    }
  }
  assert.deepEqual(bad.sort(), []);
});

// Reusable assets live in one place each. Icons: every SVG icon path is exported from src/assets/icons and imported from there, so a
// glyph is changed once. The only icon-shaped paths allowed elsewhere are bespoke artwork drawn inside its own SVG component.
const ARTWORK = new Set([
  'components/primitives/VodafoneMark.tsx', 'components/primitives/VodafoneWordmark.tsx', 'components/primitives/CountryMarker.tsx',
  'components/primitives/PanelIcon.tsx', 'components/domain/ScannedIdPreview.tsx',
  'components/patterns/wizard/StepSummarySection.tsx', 'components/patterns/wizard/StepSummaryPanel.tsx'
]);

test('assets: SVG icon paths are defined in src/assets/icons, nowhere else', () => {
  const PATH = /(['"`])M[MmLlHhVvCcSsQqTtAaZz0-9 .,-]{10,}\1/;
  const offenders = [];
  for (const f of files) {
    const r = rel(f).split(path.sep).join('/');
    if (r.startsWith('assets/icons/') || ARTWORK.has(r)) continue;
    fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      const m = line.match(PATH);
      if (m && !/\bd=\s*['"]/.test(line)) offenders.push(`${r}:${i + 1}`);
    });
  }
  assert.deepEqual(offenders, [], 'move these icon paths into src/assets/icons and import them');
});

test('assets: the icon library has one export per distinct path (no duplicate glyph under two names, no name reused)', () => {
  const seenName = new Map();
  const seenPath = new Map();
  const dupes = [];
  for (const f of fs.readdirSync(path.join(SRC, 'assets', 'icons')).filter((n) => /^(navigation|actions|status|objects)\.ts$/.test(n))) {
    for (const m of fs.readFileSync(path.join(SRC, 'assets', 'icons', f), 'utf8').matchAll(/^export const ([A-Z0-9_]+) = '([^']+)';$/gm)) {
      if (seenName.has(m[1])) dupes.push(`name ${m[1]} in ${f} and ${seenName.get(m[1])}`);
      if (seenPath.has(m[2])) dupes.push(`path of ${m[1]} is also ${seenPath.get(m[2])}`);
      seenName.set(m[1], f);
      seenPath.set(m[2], m[1]);
    }
  }
  assert.deepEqual(dupes, []);
});
