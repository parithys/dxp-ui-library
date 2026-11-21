# Story conventions (library)

Storybook is the catalogue of the library's own components. These rules keep it that way.

## Single source of truth
- A story **imports the production component** from the library's sources (`../../src`, the package barrel). It never copies, re-styles or re-implements one, and never imports the prototype or `@vfq/dxp-ui` itself.
- No Storybook-only CSS (`tests/storybookConfig.test.mjs` fails on a CSS file under `stories/` or a `<style>`). Use the library's semantic classes (`stack`, `cluster`, `caption-muted`, `title`, `notice-*` ...) only for **layout around** specimens (`_shared/layout.tsx`). No hex colours; a literal inside `style` is allowed only for a demo container width.
- Never change a component, its props or its behaviour to make a story work. If a component cannot be rendered in isolation, say so in the story's docs.
- Do not invent variants or props: a control or story exists only for something the component supports.
- App-specific data, stores, routing and capabilities do not exist here. A story that needs them belongs in the prototype's Storybook.

## Files and titles
- One file per component or closely related family: `stories/<dir>/<Name>.stories.tsx`. A story of a component in `src/components/primitives` or `src/components/ui` lives in `stories/primitives/`, whatever its `title`; foundations pages in `stories/foundations/`; multi-component forms pages in `stories/forms/`.
- `title` uses the category path: `Primitives/Button`, `Primitives/Data Display/Data Table`, `Forms/Input`, `Navigation/Tabs`, `Feedback & Status/Modal`, `Foundations/Colors`. Top-level categories (fixed order): Foundations, Primitives, Forms, Navigation, Feedback & Status. Titles are unique.
- A new component in `src/components/primitives` also needs an entry in `stories/foundations/primitivesMap.json`; a new component file needs a story that names it in its docs `source`, or an entry with a reason in `stories/coverage-exclusions.json` (`tests/storybookCoverage.test.mjs` checks both).

## File shape (CSF3, Storybook 10)
```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '../../src';
import { docsParameters } from '../_shared/docs';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  parameters: { ...docsParameters({ purpose: '...', source: 'src/components/ui/button.tsx', variants: [...], states: [...], events: [...], usage: [...], accessibility: [...] }) },
  argTypes: { variant: { control: 'select', options: ['default', 'secondary'], description: '...' }, disabled: { control: 'boolean' } },
  args: { children: 'Continue', onClick: fn() },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
```
- **Autodocs**: `tags: ['autodocs']` is global (`.storybook/preview.tsx`); do not repeat it and do not opt out. The meta carries a `component` so the page and its props table are generated from the component's own types. `docsParameters(...)` adds the fixed documentation block (purpose, source, variants, states, events, usage, validation, accessibility, devices, restrictions - only the sections that are true).
- **Stories**: `Default`, then one per real variant and size, then one per applicable state: Hover, Focus, Disabled, Read-only, Required, Loading, Error / validation error, Selected, Empty / Populated. A combined overview story (`AllVariants`, `AllStates`) uses `_shared/layout.tsx`.
- **State stories** needing hover / focus / pressed use a `play` function with `userEvent`, so the real `:hover` / `:focus-visible` styles show - never a forced class.
- **Interactive stories** hold local state in a `render` function and pass the component's real handlers, with a `play` that asserts the behaviour (open / close, select, type, keyboard).
- **Accessibility**: the a11y addon runs on every story (`parameters.a11y` stays at the preview default). Note keyboard behaviour and labels in the docs block and add a keyboard `play` for interactive controls. If a component fails an a11y rule, fix it in `src/` (or record it under Restrictions) - never patch it for the story.
- Imports: value imports from the library only; type imports with `import type`. `noUnusedLocals` and `strict` are on (`npm run typecheck`). No `console.log`.
