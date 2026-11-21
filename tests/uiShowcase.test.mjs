// shadcn/ui on top of the library's Tailwind setup: the components resolve and render, they follow the design tokens (not a second palette), the
// colliding names are renamed, `cn` works, and nothing brought a router or a second toaster in. (The app's showcase page is tested in the prototype.)
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load, close } from './harness.mjs';

const h = React.createElement;
const read = (f) => fs.readFileSync(f, 'utf8');
const pkg = JSON.parse(read('package.json'));
const UI = ['button', 'input', 'label', 'card', 'dialog', 'dropdown-menu', 'checkbox', 'tabs', 'textarea'];
after(close);

test('exactly the starter set is installed, and every component imports cn from the project\'s own utility', () => {
  assert.deepEqual(fs.readdirSync('src/components/ui').map((f) => f.replace(/\.tsx$/, '')).sort(), [...UI].sort());
  for (const name of UI) {
    const src = read(`src/components/ui/${name}.tsx`);
    assert.doesNotMatch(src, /from ['"]cn['"]/, `${name} must not import the unrelated "cn" npm package`);
    assert.match(src, /from ['"]\.\.\/\.\.\/lib\/utils['"]/, name);
    assert.doesNotMatch(src, /next-themes/, `${name}: the theme is the app's own`);
  }
});

test('dependencies: one class-merging helper, one icon set, one animation package; no router, no stray packages', () => {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
  for (const d of ['class-variance-authority', 'clsx', 'tailwind-merge', 'lucide-react', 'tw-animate-css', 'radix-ui']) assert.ok(deps[d], `${d} is a dependency`);
  for (const d of ['cn', 'next-themes', 'react-router-dom', 'tailwindcss-animate']) assert.equal(deps[d], undefined, `${d} must not be a dependency`);
  assert.equal(Object.keys(deps).filter((d) => /^@radix-ui\//.test(d)).length, 0, 'the single radix-ui package, not one package per primitive');
});

test('cn merges classes and the last conflicting Tailwind utility wins', async () => {
  const { cn } = await load('/src/lib/utils.ts');
  assert.equal(cn('p-2', undefined, 'p-4'), 'p-4');
  assert.equal(cn('text-sm', ['font-bold', undefined]), 'text-sm font-bold');
});

test('the components render through relative imports, with the shadcn data-slot markers', async () => {
  const { Button } = await load('/src/components/ui/button.tsx');
  const { Input } = await load('/src/components/ui/input.tsx');
  const { Label } = await load('/src/components/ui/label.tsx');
  const { Card, CardHeader, CardTitle, CardContent } = await load('/src/components/ui/card.tsx');
  const { Tabs, TabsList, TabsTrigger, TabsContent } = await load('/src/components/ui/tabs.tsx');
  const { Checkbox } = await load('/src/components/ui/checkbox.tsx');
  const destructive = renderToStaticMarkup(h(Button, { variant: 'destructive', size: 'lg' }, 'Delete'));
  assert.match(destructive, /data-slot="button"/);
  assert.match(renderToStaticMarkup(h(Button, { disabled: true }, 'x')), /disabled=""/);
  assert.match(renderToStaticMarkup(h('div', null, h(Label, { htmlFor: 'n' }, 'Name'), h(Input, { id: 'n', placeholder: 'p' }))), /data-slot="label"[^>]*for="n"[\s\S]*data-slot="input"[^>]*id="n"/);
  assert.match(renderToStaticMarkup(h(Card, null, h(CardHeader, null, h(CardTitle, null, 'T')), h(CardContent, null, 'C'))), /data-slot="card"[\s\S]*data-slot="card-title"[\s\S]*data-slot="card-content"/);
  const tabs = renderToStaticMarkup(h(Tabs, { defaultValue: 'a' }, h(TabsList, null, h(TabsTrigger, { value: 'a' }, 'A'), h(TabsTrigger, { value: 'b' }, 'B')), h(TabsContent, { value: 'a' }, 'panel a')));
  assert.match(tabs, /role="tablist"/);
  assert.match(tabs, /aria-selected="true"[^>]*>A</);
  assert.match(renderToStaticMarkup(h(Checkbox, { 'aria-label': 'agree', checked: true })), /role="checkbox"[^>]*aria-checked="true"/);
});

test('the shadcn colours are the app\'s own tokens: aliases onto the existing palette, the colliding names renamed, no global reset', () => {
  const css = read('src/styles/preset.css');
  for (const [name, token] of [['background', '--bg'], ['foreground', '--fg'], ['card', '--surface'], ['popover', '--surface'], ['destructive', '--danger'], ['muted-foreground', '--muted'], ['ui-accent', '--surface-subtle'], ['ui-muted', '--surface-subtle']]) {
    assert.match(css, new RegExp(`--color-${name}: var\\(${token}\\);`), `${name} -> ${token}`);
  }
  assert.match(css, /@custom-variant dark \(&:is\(\.dark \*\)\);/, 'dark: follows the app\'s .dark class');
  assert.match(css, /\[data-slot\] \{\s*border-color: var\(--border\);/, 'the border colour is scoped to the shadcn components');
  assert.doesNotMatch(css, /^\s*\*\s*\{[^}]*border-color/m, 'no universal border reset: it would change every existing element');
  assert.doesNotMatch(css, /--(?:primary|background|foreground|card|secondary|destructive|input|ring)\s*:\s*(?:#|oklch|hsl|rgb)/, 'no second raw palette');
  for (const f of fs.readdirSync('src/components/ui')) {
    const src = read(`src/components/ui/${f}`);
    assert.doesNotMatch(src, /(?<![\w-])(?:bg|text)-accent(?:-foreground)?(?![\w-])|(?<![\w-])bg-muted(?![\w-])/, `${f}: the app's accent and muted are not shadcn's`);
  }
});

test('no shadcn colour name overrides a class the app already has (a mapped `secondary` once turned every .text-secondary near-white)', () => {
  const css = read('src/styles/preset.css');
  const mapped = [...css.matchAll(/--color-([a-z-]+): var\(/g)].map((m) => m[1]);
  const own = new Set([...read('src/styles/components.css').matchAll(/^\s*\.([a-z][\w-]*)/gm)].map((m) => m[1]));
  const clash = [];
  for (const name of ['background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground', 'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted-foreground', 'destructive', 'input', 'ring', 'ui-accent', 'ui-muted']) {
    if (!mapped.includes(name)) continue;
    for (const prefix of ['text', 'bg', 'border', 'ring', 'fill', 'stroke']) if (own.has(`${prefix}-${name}`)) clash.push(`${prefix}-${name}`);
  }
  assert.deepEqual(clash, []);
  assert.ok(!mapped.includes('secondary') && !mapped.includes('primary'), 'secondary / primary are used by the app\'s own classes and are not mapped');
});

test('no router package or second toaster was brought in: the library has no toast system (Phase 5 removed the unused shadcn Toaster)', () => {
  const offenders = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = `${d}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (/\.tsx?$/.test(p) && /react-router/.test(read(p))) offenders.push(p);
    }
  })('src');
  assert.deepEqual(offenders, []);
  const users = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = `${d}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (/\.tsx?$/.test(p) && /<Toaster\b/.test(read(p))) users.push(p);
    }
  })('src');
  assert.deepEqual(users, []);
});
