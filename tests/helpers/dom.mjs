// A small, dependency-free reader for the markup react-dom/server produces, with the queries behavioural tests need: by role, by accessible name, by
// state. Behavioural tests use THIS instead of regular expressions over the markup string, so they assert what a user or assistive technology gets
// (role, name, state, relationships, text) and cannot fail merely because a CSS class, a data attribute or a wrapper element changed.
// Styling is asserted separately, in tests/styling.test.mjs (class contracts) and by the pixel snapshots in e2e/.
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#x27;': "'", '&#39;': "'", '&nbsp;': ' ' };
const decode = (s) => s.replace(/&(?:amp|lt|gt|quot|nbsp|#x27|#39);/g, (m) => ENTITIES[m]);

/** @typedef {{ tag: string, attrs: Record<string, string>, children: Node[], parent: El | null }} El */
/** @typedef {El | { text: string }} Node */

/** Parses a markup string into a tree (the root is a synthetic `#root`). */
export function parse(markup) {
  const root = { tag: '#root', attrs: {}, children: [], parent: null };
  let cur = root;
  const re = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s=>/]+(?:=(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(markup))) {
    if (m[1]) {
      for (let e = cur; e; e = e.parent) if (e.tag === m[1].toLowerCase()) { cur = e.parent ?? root; break; }
    } else if (m[2]) {
      const attrs = {};
      for (const a of m[3].matchAll(/\s+([^\s=>/]+)(?:=(?:"([^"]*)"|'([^']*)'))?/g)) attrs[a[1].toLowerCase()] = decode(a[2] ?? a[3] ?? ''); // React writes readOnly, tabIndex ... in camel case; HTML names are case-insensitive
      const el = { tag: m[2].toLowerCase(), attrs, children: [], parent: cur };
      cur.children.push(el);
      if (!m[4] && !VOID.has(el.tag)) cur = el;
    } else if (m[5] !== undefined) {
      cur.children.push({ text: decode(m[5]) });
    }
  }
  return root;
}

const isEl = (n) => 'tag' in n;
/** Every element under `node`, document order. */
export function all(node) {
  const out = [];
  (function walk(n) { for (const c of n.children) if (isEl(c)) { out.push(c); walk(c); } })(node);
  return out;
}
export const text = (node) => (isEl(node) ? node.children.map(text).join('') : node.text).replace(/\s+/g, ' ').trim();

const IMPLICIT = { button: 'button', a: 'link', h1: 'heading', h2: 'heading', h3: 'heading', h4: 'heading', nav: 'navigation', main: 'main', ul: 'list', ol: 'list', li: 'listitem', table: 'table', th: 'columnheader', tr: 'row', dialog: 'dialog', textarea: 'textbox', select: 'combobox', label: undefined };
/** The element's role: an explicit `role`, else the native one (an input by its type). */
export function roleOf(el) {
  if (el.attrs.role) return el.attrs.role;
  if (el.tag === 'input') return { checkbox: 'checkbox', radio: 'radio', button: 'button', submit: 'button', range: 'slider', number: 'spinbutton', hidden: undefined }[el.attrs.type ?? 'text'] ?? 'textbox';
  return IMPLICIT[el.tag];
}
const byId = (root, id) => all(root).find((e) => e.attrs.id === id);
const rootOf = (el) => { let e = el; while (e.parent) e = e.parent; return e; };

/** The accessible name: aria-labelledby, aria-label, a <label for> or wrapping <label>, then the element's own text (for roles named by content). */
export function nameOf(el) {
  const root = rootOf(el);
  if (el.attrs['aria-labelledby']) return el.attrs['aria-labelledby'].split(/\s+/).map((id) => byId(root, id)).filter(Boolean).map(text).join(' ');
  if (el.attrs['aria-label']) return el.attrs['aria-label'];
  if (el.attrs.id) { const l = all(root).find((e) => e.tag === 'label' && e.attrs.for === el.attrs.id); if (l) return labelText(l); }
  for (let p = el.parent; p; p = p.parent) if (p.tag === 'label') return labelText(p);
  return text(el);
}
// A label's visible text, without an aria-hidden required marker.
const labelText = (l) => l.children.map((c) => (isEl(c) ? (c.attrs['aria-hidden'] === 'true' ? '' : labelText(c)) : c.text)).join('').replace(/\s+/g, ' ').trim();

/** Whether the element is hidden from assistive technology (it or an ancestor is aria-hidden, or hidden). */
export function hiddenFromAT(el) {
  for (let e = el; e && e.tag !== '#root'; e = e.parent) if (e.attrs['aria-hidden'] === 'true' || 'hidden' in e.attrs) return true;
  return false;
}
/** All elements with `role` that assistive technology can see (optionally with an accessible name, string or RegExp), like Testing Library's getAllByRole. */
export function byRole(root, role, name) {
  return all(root).filter((e) => !hiddenFromAT(e) && roleOf(e) === role && (name === undefined || (name instanceof RegExp ? name.test(nameOf(e)) : nameOf(e) === name)));
}
/** The one element with `role` (and name); throws if there are none or several, like a Testing Library getByRole. */
export function getByRole(root, role, name) {
  const found = byRole(root, role, name);
  if (found.length !== 1) throw new Error(`expected one ${role}${name === undefined ? '' : ` named ${name}`}, found ${found.length}`);
  return found[0];
}
/** The element's state as a user or assistive technology sees it. */
export function stateOf(el) {
  const a = el.attrs;
  const flag = (k) => (k in a ? a[k] !== 'false' : false);
  return {
    disabled: 'disabled' in a || a['aria-disabled'] === 'true',
    checked: a['aria-checked'] !== undefined ? a['aria-checked'] === 'true' : 'checked' in a,
    selected: a['aria-selected'] === 'true',
    pressed: a['aria-pressed'] === 'true',
    expanded: a['aria-expanded'] === undefined ? undefined : a['aria-expanded'] === 'true',
    invalid: a['aria-invalid'] === 'true',
    required: 'required' in a || a['aria-required'] === 'true',
    readOnly: 'readonly' in a || flag('aria-readonly'),
    busy: a['aria-busy'] === 'true',
    describedBy: a['aria-describedby'] ?? null,
  };
}
/** The elements an element's `aria-describedby` points at. */
export const describedBy = (el) => (el.attrs['aria-describedby'] ?? '').split(/\s+/).filter(Boolean).map((id) => byId(rootOf(el), id)).filter(Boolean);
/** Whether the element can be reached by sequential keyboard navigation in the markup (a native control that is not disabled, or tabindex >= 0). */
export function tabbable(el) {
  if ('disabled' in el.attrs || el.attrs.tabindex === '-1') return false;
  if (el.attrs.tabindex !== undefined) return true;
  return ['button', 'a', 'input', 'select', 'textarea'].includes(el.tag) && (el.tag !== 'a' || 'href' in el.attrs) && el.attrs.type !== 'hidden';
}
