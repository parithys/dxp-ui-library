# Changelog

All notable changes to `@vfq/dxp-ui` are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/) and the project uses [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-11-21

### Added
- First release: the design system extracted from the Vodafone Qatar DXP application.
- `components/ui` (shadcn/ui base components), `components/primitives` (field composites and UI primitives), icons, utilities and hooks, exported from one entry (ESM + CJS + types).
- Design tokens (`tokens.css`), the Tailwind v4 preset (`preset.css`), the semantic component classes (`components.css`), the Tooltip pack and a compiled `styles.css`.
- `LinkProvider` / `useLink`: the router-agnostic link used by `DataTable`.
- `cardParts` (`CARD_SELECTED`, `CARD_IDLE`, `CARD_HIGHLIGHT`, `SelectedTick`, `SelectedCardTexture`), split out of the application's offer-card pieces.

### Changed (relative to the application's former in-app components)
- The shadcn `Input`, `Tabs` and `Textarea` controls are exported as `BaseInput`, `BaseTabs` and `BaseTextarea`; `Input`, `Tabs` and `Textarea` are the field composites.
