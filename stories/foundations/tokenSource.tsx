// Shared helpers for the Foundations stories: the design tokens are READ from src/styles/tokens.css (Vite raw import) and from the live :root, so a
// token added, renamed or re-valued in the app shows here with no edit. Nothing in this folder restates a token value.
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import tokensCss from '../../src/styles/tokens.css?raw';

export interface TokenDecl {
  name: string;
  /** Declared in `:root` (the light theme). */
  light?: string;
  /** Declared in `:root.dark` (the dark override), when there is one. */
  dark?: string;
  /** Declared in `[data-device='tablet']`, when there is one. */
  tablet?: string;
}

/** Every custom property declared in tokens.css, in file order, with its light / dark / tablet declaration. */
export function parseTokens(css: string = tokensCss): TokenDecl[] {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const byName = new Map<string, TokenDecl>();
  for (const block of bare.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = block[1].trim();
    const slot = selector === ':root' ? 'light' : selector === ':root.dark' ? 'dark' : selector === "[data-device='tablet']" ? 'tablet' : undefined;
    if (!slot) continue;
    for (const decl of block[2].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
      const entry = byName.get(decl[1]) ?? { name: decl[1] };
      entry[slot] = decl[2].trim().replace(/\s+/g, ' ');
      byName.set(decl[1], entry);
    }
  }
  return [...byName.values()];
}

export const TOKENS: TokenDecl[] = parseTokens();

/** The theme the toolbar has applied (the `.dark` class on <html>); re-renders the caller when it changes, so live values stay current. */
export function useTheme(): 'light' | 'dark' {
  const read = () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  const [theme, setTheme] = useState<'light' | 'dark'>(read);
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-device'] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

/** The token's resolved value on :root right now (var() references substituted), for the current theme and device. */
export function readToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** True when a value is a CSS colour (asked of the browser, not guessed from the text). */
export function isColour(value: string): boolean {
  if (!value) return false;
  if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') return CSS.supports('color', value);
  return /^(#|rgba?\(|hsla?\(|color-mix\(|oklch\(|oklab\()/i.test(value);
}

/** A value with no var() reference means the same in either theme, so it can be painted as declared. */
export const isSelfContained = (value?: string): value is string => !!value && !value.includes('var(');

/** Section heading + children, laid out with the app's own classes. */
export function Section({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section className="stack gap-3">
      <h3 className="title title-md">{title}</h3>
      {note && <p className="caption-muted">{note}</p>}
      {children}
    </section>
  );
}

/** Filter box (the app's own form-control class). */
export function FilterBox({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <input
      type="search"
      aria-label={label}
      placeholder={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="form-control"
    />
  );
}
