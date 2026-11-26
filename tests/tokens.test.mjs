// Design-token governance of the library's tokens. Reads them from the CSS itself (tests/tokenModel.mjs). Whether the APP reads every token
// (no dead tokens) is checked in the prototype, which is the consumer.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTokens, undefinedRefs, colourTokensWithoutDark } from './tokenModel.mjs';

// Raw-colour tokens that are deliberately the SAME in light and dark mode, with the reason. Everything else that holds a
// raw colour must define a dark value in :root.dark (aliases and color-mix() follow their sources and are exempt).
const CONSTANT_ACROSS_THEMES = {
  '--summary-milestone': 'Step Summary progress fill and milestone disc; same orange in both themes',
  '--tag-primary-fg': 'white label on the solid plum Primary marker',
  '--accent': 'brand red; the accent fill is identical in both themes',
  '--accent-on': 'text on the accent fill',
  '--badge-success-solid': 'solid success badge, white label',
  '--success-solid': 'solid green fill under a white label; --success is lightened in dark and would drop to 2.1:1',
  '--danger-solid': 'solid red fill under a white label; --danger is lightened in dark and would drop to 3.4:1',
  '--warn-solid': 'amber eligibility icon tile under a white icon; the lightened dark amber would lose the contrast',
  '--info-solid': 'violet eligibility icon tile under a white icon; --info is lightened in dark',
  '--advisory-solid': 'blue eligibility icon tile under a white icon; --tint-blue-fg is lightened in dark',
  '--brand-vodafone': 'brand speech-mark red',
  '--brand-qatar': 'Qatar flag maroon',
  '--tag-primary-bg': 'Primary marker: solid plum under a white label, same in both themes',
  '--charcoal-panel': 'dark panel used in both themes (login help, dark selects)',
  '--field-calendar-range': 'teal range highlight on the dark toast and calendar',
  '--grey-disabled': 'disabled glyph grey, legible on both',
  '--paper': 'a surface that must stay white (QR code, photographed ID)',
  '--signature-ink': 'signature stroke: dark on a white pad and on the printed CAF in both themes',
  '--scrim': 'backdrop',
};
const ON_DARK = /^--on-dark/; // the on-dark family is constant by definition

test('tokens: every var(--x) used in the library is defined', () => {
  assert.deepEqual(undefinedRefs(), []);
});

test('tokens: every raw-colour token has a dark value or is listed as constant across themes', () => {
  const missing = colourTokensWithoutDark().filter((t) => !(t in CONSTANT_ACROSS_THEMES) && !ON_DARK.test(t));
  assert.deepEqual(missing, [], 'add a value to :root.dark in tokens.css, or list the token in CONSTANT_ACROSS_THEMES with a reason');
});

test('tokens: the constant-across-themes list has no stale entries', () => {
  const { light, dark } = loadTokens();
  const stale = Object.keys(CONSTANT_ACROSS_THEMES).filter((t) => !light.has(t) || dark.has(t));
  assert.deepEqual(stale, []);
});

test('tokens: spacing, weight and stacking scales exist and Tailwind is bound to them', async () => {
  const { light, theme } = loadTokens();
  for (const t of ['--space-unit', '--fw-regular', '--fw-medium', '--fw-semibold', '--fw-bold', '--z-overlay', '--z-popover', '--z-toast', '--z-tooltip', '--motion-fast', '--motion-base', '--motion-slow'])
    assert.ok(light.has(t), `${t} is missing from tokens.css`);
  assert.equal(theme.get('--spacing'), 'var(--space-unit)');
  assert.equal(theme.get('--font-weight-bold'), 'var(--fw-bold)');
});

// ---- palette consolidation (2026-11-16): one shade per role ---------------------------------------------------------
// Two different raw shades whose perceptual distance (OKLab) is under 0.02 look the same to a reader, so they should be ONE token
// that the others alias (`--nav-fg: var(--fg)`), not two literals that drift apart. A new near-identical pair fails here: point the
// new token at the existing one, or - if the two really are different roles - list the pair below with the reason.
const NEAR_IDENTICAL_REVIEWED = {
  '#e3effd|#e6e9f5': '--tint-blue-bg and --tint-indigo-bg: a blue and an indigo tint, two different feature families',
  '#dcf3f1|#e3f4e6': '--tint-teal-bg and --tint-green-bg: teal and green tints (teal also marks the customer view)',
  '#212121|#21232b': '--color-field-text-filled (near-black text) and --charcoal-panel (a dark panel fill)',
  '#fff1d6|#fff8e1': '--tint-amber-bg (amber fill) and --warn-bg (the lighter warning notice fill)',
};
const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function oklab(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16)));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}

test('palette: no two different raw shades in the light theme are near-identical (OKLab distance under 0.02) unless reviewed', () => {
  const { light } = loadTokens();
  const shades = new Map();
  for (const [name, value] of light) if (/^#[0-9a-f]{6}$/i.test(value.trim())) shades.set(value.trim().toLowerCase(), [...(shades.get(value.trim().toLowerCase()) ?? []), name]);
  const hexes = [...shades.keys()].sort();
  const found = [];
  for (let i = 0; i < hexes.length; i++)
    for (let j = i + 1; j < hexes.length; j++) {
      const a = oklab(hexes[i]);
      const b = oklab(hexes[j]);
      if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 0.02) found.push(`${hexes[i]}|${hexes[j]}`);
    }
  const unreviewed = found.filter((p) => !(p in NEAR_IDENTICAL_REVIEWED));
  assert.deepEqual(unreviewed, [], 'near-identical shades: alias one token to the other (var(--x)), or list the pair in NEAR_IDENTICAL_REVIEWED with the reason');
  assert.deepEqual(Object.keys(NEAR_IDENTICAL_REVIEWED).filter((p) => !found.includes(p)), [], 'stale entries in NEAR_IDENTICAL_REVIEWED');
});

test('palette: the neutrals and brand reds that were duplicated are aliases of one token now', () => {
  const { light } = loadTokens();
  const aliasOf = { '--nav-fg': 'var(--fg)', '--nav-bg': 'var(--bg)', '--nav-border': 'var(--border)', '--table-border': 'var(--border)', '--grey-form': 'var(--border)', '--field-bg-disabled': 'var(--border-soft)',
    '--surface-subtle': 'var(--surface)', '--light-neutral': 'var(--surface)', '--nav-hover-bg': 'var(--surface)', '--table-header-bg': 'var(--surface)', '--icon-tile-bg': 'var(--surface)',
    '--field-card-selected': 'var(--accent)', '--nav-active-bg': 'var(--accent)', '--field-checkbox-selected': 'var(--accent)', '--field-radio-selected': 'var(--accent)', '--field-border-error': 'var(--accent-text)',
    '--tag-blue-bg': 'var(--tint-blue-bg)', '--tag-blue-fg': 'var(--signal-blue)', '--tag-amber-bg': 'var(--tint-amber-bg)', '--segment-cbu-bg': 'var(--tint-pink-bg)', '--danger': 'var(--danger-solid)' };
  for (const [token, want] of Object.entries(aliasOf)) assert.equal(light.get(token)?.trim(), want, `${token} should be ${want}`);
});
