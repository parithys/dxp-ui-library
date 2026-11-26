# Changelog

All notable changes to `@vfq/dxp-ui` are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.0] - 2026-11-26

### Added
- Components moved in from the application: `PageHeader`, `KeyInformationPanel`, `OrderConfirmationScreen`, `CheckoutSummaryTables`, `StarStat`, `OsmEmbed`, `ScanFailureNotice`, `FileImagePreview`, `RemoveDocumentDialog`, `SignatureCapture`, `CommentsField`, `ErrorBoundary`, `EntityMissing`, `CameraCaptureButton`, `DocumentCaptureActions`, `DocumentFileMeta`, and the guided-flow shell (`WizardTitleBand`, `WizardStepPanel`, `WizardStepHeader`, `WizardFooter`, `WizardDialogs`, `CustomerViewButton`, `CustomerMirrorPanel`, `StepSummarySection`, `SummaryFieldRow`, `StandaloneStepPage`).
- Helpers: `formatMoney` / `formatMoneyAny` / `formatMoneyLoose` and the date, size and amount formatters; `documentFileStore`, `documentScan`, `documentUploadRules` (`uploadRules`, `uploadFileProblem`), `pdfFromImages`, `pdfPageCount`, `printDocument`, `values`, `stepSummary`, `wizardNavigation`, the `WizardStep` type, and the `useStepFocus` / `useDocumentScan` hooks.
- Semantic classes (the `eligibility-alert` family, `title-band`, `split-wide`, `focus-ring`, `page-bleed` ...) and tokens (`--title-band-bg`, `--alert-*`, `--size-step-header-*`, `--summary-milestone` ...).
- `npm run dev:app`: rebuild and copy into an application for live editing.
- Classes `customer-view-btn`, `footer-bar-pad` and `map-fill` (used by `CustomerViewButton`, `WizardFooter` and `OsmEmbed` but previously defined only in the application), and the tokens `--customer-view-bg`, `--customer-view-bg-hover`, `--customer-view-fg`, `--info-banner-border` and `--priority` (light and dark).

### Changed
- `formatMoney(currency, amount, { nbsp })` really uses a non-breaking space when asked (the application's former `formatQar` ignored the option).
- `EntityMissing` draws its link through `LinkProvider`; `ErrorBoundary` takes `homeHref`; `WizardStepHeader` takes `hasCustomerView`; `CustomerMirrorPanel` takes `summaryLabel` and `reserveCornerHeight`; `DocumentCaptureActions` takes `scanner`.

## [0.1.0] - 2026-11-21

### Added
- First release: the design system extracted from the Vodafone Qatar DXP application.
- `components/ui` (shadcn/ui base components), `components/primitives` (field composites and UI primitives), icons, utilities and hooks, exported from one entry (ESM + CJS + types).
- Design tokens (`tokens.css`), the Tailwind v4 preset (`preset.css`), the semantic component classes (`components.css`), the Tooltip pack and a compiled `styles.css`.
- `LinkProvider` / `useLink`: the router-agnostic link used by `DataTable`.
- `cardParts` (`CARD_SELECTED`, `CARD_IDLE`, `CARD_HIGHLIGHT`, `SelectedTick`, `SelectedCardTexture`), split out of the application's offer-card pieces.

### Changed (relative to the application's former in-app components)
- The shadcn `Input`, `Tabs` and `Textarea` controls are exported as `BaseInput`, `BaseTabs` and `BaseTextarea`; `Input`, `Tabs` and `Textarea` are the field composites.
