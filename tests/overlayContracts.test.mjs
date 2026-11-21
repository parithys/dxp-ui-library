// Phase 6: the contract of the library's overlays (Modal and Drawer on the Radix Dialog), pinned without a browser; the browser half
// is e2e/overlays.spec.ts (prototype). The app-side rules (leave-journey guard, no hand-written overlay) are in prototype/tests/overlayContracts.test.mjs. See docs/migration/phase6-overlays-select.md.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { close } from './harness.mjs';

const read = (f) => fs.readFileSync(f, 'utf8');
after(close);
const walk = (d, out = []) => {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(p)) out.push(p.split(path.sep).join('/'));
  }
  return out;
};

test('Modal and Drawer are thin wrappers over the one Radix Dialog (components/ui/dialog.tsx) with their API unchanged', () => {
  const modal = read('src/components/primitives/Modal.tsx');
  const drawer = read('src/components/primitives/Drawer.tsx');
  for (const [name, src] of [['Modal', modal], ['Drawer', drawer]]) {
    assert.match(src, /from '\.\.\/ui\/dialog'/, name);
    assert.match(src, /onOpenChange=\{\(next\) => !next && onClose\(\)\}/, `${name}: Radix reports closing through the caller's onClose`);
    assert.match(src, /<DialogTitle/, `${name}: named by its title (aria-labelledby)`);
    assert.doesNotMatch(src, /useDialogBehaviour/, name);
  }
  // Every Modal is the sectioned layout (header, body, footer set off by rules); callers still pass open / onClose / title / footer, with an optional icon and subtitle.
  assert.match(modal, /<DialogContent className=\{`\$\{widthClassName\} modal-dialog-sectioned`\}>/);
  assert.match(modal, /export function Modal\(\{ open, onClose, title, children, footer, widthClassName = 'max-w-lg', icon, subtitle \}/);
  assert.match(modal, /modal-header[\s\S]*modal-body[\s\S]*modal-footer/, 'header, body and footer in that order');
  assert.match(drawer, /<DialogContent variant="drawer">/);
  assert.match(drawer, /export function Drawer\(\{ open, onClose, title, children, footer, header, bodyClassName = 'px-6 py-6' \}/);
  assert.ok(!fs.existsSync('src/components/primitives/useDialogBehaviour.ts'), 'the hand-written focus / Escape hook is gone: Radix owns it');
});

test('the Dialog keeps what Radix does not do by default: container focus, focus back to the opener, a combobox keeps its own Escape, a drawer ignores outside clicks, the app look', () => {
  const src = read('src/components/ui/dialog.tsx');
  assert.ok(src.includes('opener.current = document.activeElement') && src.includes('ref.current?.focus({ preventScroll: true })'), 'initial focus is the container');
  assert.ok(src.includes('const back = opener.current') && src.includes('back.focus({ preventScroll: true })'), 'focus returns to the opener');
  assert.match(src, /closest\?\.\("\[role=combobox\]\[aria-expanded=true\]"\)\) e\.preventDefault\(\)/, 'Escape on an open combobox does not close the dialog');
  assert.match(src, /onInteractOutside=\{\(e\) => \{\n\s+if \(drawer\) e\.preventDefault\(\)/, 'a drawer is not closed by a click outside');
  assert.match(src, /aria-describedby=\{undefined\}/, 'no description is invented');
});

test('overlays: one dialog implementation in the library; nothing locks scroll by hand, listens to popstate or writes to <body>', () => {
  const files = walk('src');
  assert.deepEqual(files.filter((f) => /from '\.\.\/ui\/dialog'/.test(read(f))).sort(), ['src/components/primitives/Drawer.tsx', 'src/components/primitives/Modal.tsx']);
  assert.deepEqual(files.filter((f) => /popstate/.test(read(f).replace(/\/\/.*$/gm, ''))), [], 'browser Back/Forward are not intercepted anywhere');
  assert.deepEqual(files.filter((f) => /document\.body\.style|body\.classList/.test(read(f))), [], 'nothing writes to <body> by hand (Radix does the scroll lock)');
  assert.deepEqual(files.filter((f) => /addEventListener\('beforeunload'/.test(read(f))), []);
});

test('Select inside an overlay: the library Select stops Escape from reaching the dialog that holds it', () => {
  const src = read('src/components/primitives/Select.tsx');
  assert.match(src, /e\.stopPropagation\(\);\n\s+close\(true\);/);
  // ...and Radix listens in the capture phase, so the Dialog defers to an open combobox itself (see the test above).
  assert.match(read('src/components/ui/dialog.tsx'), /role=combobox/);
});
