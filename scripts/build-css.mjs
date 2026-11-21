// Builds dist/styles.css (Tailwind compiled over the library's own sources) and copies the CSS partials Tailwind consumers import (dist/css/*).
import { mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(root + p, 'utf8');
mkdirSync(root + 'dist/css', { recursive: true });
const entry = root + 'src/styles/styles.css';
const out = await postcss([tailwind()]).process(read('src/styles/styles.css'), { from: entry, to: root + 'dist/styles.css' });
writeFileSync(root + 'dist/styles.css', out.css);
for (const [from, to] of [['src/styles/preset.css', 'preset.css'], ['src/styles/tokens.css', 'tokens.css'], ['src/styles/components.css', 'components.css']]) copyFileSync(root + from, root + 'dist/css/' + to);
// the tooltip pack: its tokens and rules as one file
writeFileSync(root + 'dist/css/tooltip.css', read('src/components/primitives/tooltip-tokens.css') + '\n' + read('src/components/primitives/tooltip.css'));
console.log('css built');
