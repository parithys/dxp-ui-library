# @vfq/dxp-ui

The **DXP UI library**: the Vodafone Qatar DXP design system as an npm package. React 19 + TypeScript, built on shadcn/ui (Radix + Tailwind v4 + class-variance-authority), with design tokens, semantic component classes, hooks and icons. It knows no journey, no router and no mock data.

## What is in it

| Area | Content |
|---|---|
| `components/ui` | The shadcn/ui base components: `Button`, `Card`, `Checkbox`, `Dialog`, `DropdownMenu`, `Label`, plus `BaseInput`, `BaseTabs`, `BaseTextarea` (the shadcn controls, named `Base*` because the field composites below take the plain names). |
| `components/primitives` | Field composites and UI primitives: `Input`, `Textarea`, `Select` (searchable), `DateInput`, `PhoneNumberInput`, `SignaturePad`, `DataTable`, `Modal`, `Drawer`, `Tooltip`, `Tabs`, `Badge`, `Switch`, `Radio`, `Pager`, `Pagination`, `EmptyState`, `ChoiceCards`, `Spinner`, ... |
| `lib`, `hooks` | `cn`, date helpers (`dateField`), device and input-modality detection, popover placement, `LinkProvider`, `useMinWidth`, `useEnterToSubmit`, `useSearchListNav`. |
| `assets/icons` | Every SVG icon path (navigation, actions, status, objects). |
| Styles | `tokens.css` (colours, type, spacing, radius, shadows as CSS variables, light and dark), `preset.css` (Tailwind v4 theme mapping and global base), `components.css` (the semantic classes: `.btn .btn-primary`, `.card`, `.badge-success`, `.form-control`, ...), the Tooltip pack. |

## Install

```bash
npm install @vfq/dxp-ui
```

`react` and `react-dom` (>= 19) are peer dependencies. Everything else is a dependency of the package.

## Set up the styles

**Tailwind v4 application (recommended).** Use the preset and the component classes, and let Tailwind scan the library for the utilities its components use:

```css
/* app/globals.css */
@import "tailwindcss" source(".");
@source "../node_modules/@vfq/dxp-ui/dist";
@import "@vfq/dxp-ui/preset.css";      /* tokens, theme, dark variant, base styles (also imports tw-animate-css) */
@import "@vfq/dxp-ui/components.css";  /* the semantic component classes (@layer components) */
@import "@vfq/dxp-ui/tooltip.css";     /* the Tooltip pack */
```

The page font is Figtree: load it once in your document head (see the prototype's `app/layout.tsx`).

**Any other application (no Tailwind).** Import the compiled stylesheet once:

```ts
import '@vfq/dxp-ui/styles.css';
```

## Use

```tsx
import { Button, Card, Input, Select, DateInput, Badge } from '@vfq/dxp-ui';

export function Example() {
  return (
    <Card className="p-6">
      <Input label="Email ID" type="email" required />
      <DateInput label="Expiry Date" value={value} onChange={(e) => setValue(e.target.value)} />
      <Button variant="secondary">Save</Button>
    </Card>
  );
}
```

`DataTable` draws row links through a link component you provide once, so the library needs no router:

```tsx
import { LinkProvider } from '@vfq/dxp-ui';
<LinkProvider value={MyRouterLink}>{children}</LinkProvider>   // MyRouterLink takes { to, replace?, state?, ...anchorProps }
```

## Develop

```bash
npm run storybook        # component catalogue on http://localhost:6006 (SB_PORT to change)
npm run build            # dist/index.js (ESM), dist/index.cjs, dist/*.d.ts, dist/styles.css, dist/css/*
npm run typecheck && npm run lint && npm test
npm run build-storybook
```

### Add a component

1. Create it in `src/components/primitives/` (or `ui/` for a shadcn base component). No journey wording, no router, no business data, no import from an application.
2. Style it with the tokens and the semantic classes: add a class to `src/styles/components.css` (`.component`, `.component-variant`, `.component-size`, `.component-state`) rather than long utility strings.
3. Export it from `src/index.ts`.
4. Add a story in `stories/` covering its variants, sizes and states (default, hover, focus, disabled, error, loading) with `tags: ['autodocs']`.
5. Add a test in `tests/` when it carries a rule.
6. `npm run typecheck && npm run lint && npm test && npm run build && npm run build-storybook`.

### Live-edit a component inside an application

The library is the single source of truth for reusable UI and its Storybook; an application keeps none. To see a change in the application as you make it:

```bash
npm run dev:app                  # watches src/, rebuilds, copies dist into ../prototype/node_modules/dxp-ui/dist
npm run dev:app -- ../other-app  # another application (or DXP_APP=../other-app)
npm run dev:app -- --once        # one build and copy
```

Run the application's own dev server as usual. The script copies (it never links), so the application keeps one copy of React. Before pushing, install the real tarball in the application (below) and run its checks, as CI does.

### Promote a component from an application

A reusable component should be started here. If one was written in an application first:

1. `git mv` it into `src/components/primitives/` (helpers into `src/lib/` or `src/hooks/`). Replace every application import (store, router, mock data, business wording) with a prop, a callback or a provider (`LinkProvider` is the pattern for links).
2. Move the classes it uses from the application's CSS into `src/styles/components.css` as single semantic rules, and its tokens into `src/styles/tokens.css`. Do not copy long utility strings: the class budget and the duplicate-class test reject them.
3. Export it from `src/index.ts`, add a story under `stories/` and an entry in `stories/foundations/primitivesMap.json`.
4. Move the assertions that read its source into a library test (`tests/movedComponents.test.mjs`); the application can no longer read it.
5. Release (below), install in the application, rewrite its imports to the package, delete its copy.

A component that is keyed to one product's data (a line-type tag, an ID-document upload) is a business component and stays in the application.

### Use a local build in an application before publishing

Avoid a plain `npm link` / `file:` symlink: the library's own `react` copy makes React resolve twice. Install the packed tarball instead:

```bash
npm run build && npm pack          # vfq-dxp-ui-<version>.tgz
cd ../your-app && npm install ../dxp-ui-library/vfq-dxp-ui-<version>.tgz
```

If you do link it, alias `react` and `react-dom` to the application's copy (bundler `resolve.alias` / `dedupe`, and TypeScript `paths`).

## Versioning and release

Semantic versioning. Update `CHANGELOG.md`, then:

```bash
npm version <patch|minor|major>
npm run build && npm run typecheck && npm run lint && npm test && npm run build-storybook
npm pack                  # inspect the tarball
npm publish --access restricted   # to the @vfq scope
```

A removed or renamed export, a removed prop or a changed semantic class name is a breaking change (major).
