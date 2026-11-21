# @vfq/dxp-ui - Storybook

The component catalogue and design-system reference for the **DXP UI library**. It is standalone (its own tool chain) and derived from the library: every
story imports the component from `src/`, and the preview loads the library's own CSS (`src/styles`: preset, components, tooltip pack) exactly as a consuming
application does. Nothing is copied or restyled for Storybook. Application patterns, capabilities and business components are in the prototype's own Storybook.

## Run it

```bash
npm run storybook          # dev server on http://localhost:6006 (SB_PORT=... to change)
npm run build-storybook    # static build into storybook-static/ (git-ignored)
npm run typecheck          # tsc over src and stories
npm run lint               # oxlint
npm test                   # includes tests/storybook*.test.mjs (config and coverage guards)
node scripts/storybook-coverage.mjs [--write]   # component -> story map (writes stories/COVERAGE.md)
```

## Layout

| Path | What |
| --- | --- |
| `.storybook/main.ts` | Vite config: `@storybook/react-vite`, addons `addon-docs` and `addon-a11y`, Tailwind v4 through `@tailwindcss/vite`, props tables from `react-docgen-typescript` |
| `.storybook/preview.tsx` | Imports `storybook.css`; toolbar **Theme** (light/dark, the `.dark` class) and **Device** (web/tablet, `data-device`); `tags: ['autodocs']` for every story file; the a11y parameters |
| `.storybook/storybook.css` | Tailwind entry that imports the library CSS and scans `src/` and `stories/`. It declares no rule of its own |
| `stories/primitives/` | One story file per component of `src/components/primitives` and `src/components/ui`, whatever its sidebar group (Input is under Forms, Tabs under Navigation, Modal under Feedback & Status) |
| `stories/forms/`, `stories/foundations/` | Forms pages that are not a single component; Foundations: tokens, colour, type, spacing, radius, icons, brand marks, layout vocabulary, themes and device, accessibility, the Primitives Map and the Introduction |
| `stories/_shared/` | `docs.ts` (the fixed documentation block each component carries) and `layout.tsx` (layout helpers) |
| `stories/CONVENTIONS.md` | The rules every story follows |
| `stories/COVERAGE.md` | Generated map: component -> stories |
| `stories/coverage-exclusions.json` | Components deliberately without a story, with the reason |
