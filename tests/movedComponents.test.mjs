// Source guards for components that moved here from the application (the application's own tests can no longer read their source).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(f, 'utf8');
const P = 'src/components/primitives/';

test('WizardTitleBand: Abandon Order is always a secondary button, drawn in one place', () => {
  const band = read(P + 'WizardTitleBand.tsx');
  assert.match(band, /<Button\s+variant="secondary"\s+size="sm"\s+onClick=\{onRequestAbandon\}\s*>\s*Abandon Order/);
  assert.equal((band.match(/Abandon Order\s*<\/Button>/g) ?? []).length, 1);
});

test('CheckoutSummaryTables marks an agent-only table and row', () => {
  const s = read(P + 'CheckoutSummaryTables.tsx');
  assert.match(s, /t\.agentOnly \? 'agent-only' : ''/);
  assert.match(s, /row\.agentOnly \? 'agent-only'/);
});

test('OrderConfirmationScreen hides its action buttons when printed or shared (no-print)', () => {
  assert.match(read(P + 'OrderConfirmationScreen.tsx'), /no-print print:hidden/);
});

test('PageHeader renders h1, or h2 with level 2', () => {
  assert.match(read(P + 'PageHeader.tsx'), /level === 1 \? 'h1' : 'h2'/);
});

test('the title band surfaces read --title-band-bg', () => {
  for (const f of ['PageHeader.tsx', 'WizardTitleBand.tsx']) assert.match(read(P + f), /bg-\[var\(--title-band-bg\)\]|title-band/, f);
});

test('StepSummarySection marks a finished step with the success tick', () => {
  assert.match(read(P + 'StepSummarySection.tsx'), /text-success/);
});

test('FileImagePreview: a picture of an earlier file is never shown for a later one, and the image has alt text and a named delete button per page', () => {
  const v = read(P + 'FileImagePreview.tsx');
  assert.match(v, /read\?\.file !== file\) return null/);
  assert.match(v, /alt=\{`Preview of \$\{file\.name\}`\}/);
  assert.match(v, /label=\{`Delete page \$\{i \+ 1\}`\}/);
});

test('ScanFailureNotice is the eligibility result card: icon tile, bold title, no label above it', () => {
  const s = read(P + 'ScanFailureNotice.tsx');
  assert.match(s, /className=[`"']eligibility-alert /);
  assert.match(s, /eligibility-alert-icon/);
  assert.match(s, /title title-md/);
  assert.doesNotMatch(s, /caps-strong/);
});

// ---- the document capture, wizard shell and states components (moved in phase 2) ----
const LIB = 'src/lib/';

test('EntityMissing keeps loading (status), failed (alert, with retry) and not found distinct, and draws its link through the host\'s link component', () => {
  const s = read(P + 'EntityMissing.tsx');
  assert.match(s, /role="alert"[\s\S]*Try Again/);
  assert.match(s, /role="status"[\s\S]*Loading \{what\}/);
  assert.match(s, /We could not find this \{what\}/);
  assert.match(s, /useLink\(\)/);
});

test('WizardStepHeader: the heading follows the answers, the tray reserves its width through a token, and the customer-view policy is the host\'s', () => {
  const s = read(P + 'WizardStepHeader.tsx');
  assert.match(s, /currentStep\?\.headingFor\?\.\(values\)\) \?\? currentStep\?\.heading \?\? currentStep\?\.label/);
  assert.match(s, /trayAside/);
  assert.match(s, /lg:pr-\[var\(--size-step-header-pad-tray\)\]/);
  assert.match(s, /hasCustomerView/);
  assert.match(fs.readFileSync('src/styles/tokens.css', 'utf8'), /--size-step-header-pad-tray:\s*22rem;/);
});

test('WizardFooter: the fixed bar sits above a bottom tray when asked, and reserves no gap for it beside Continue', () => {
  const s = read(P + 'WizardFooter.tsx');
  assert.match(s, /bottom-20 lg:bottom-0/);
  assert.match(s, /action-bar \$\{fixedPosition\}/);
  assert.match(s, /row-between w-full/);
  assert.doesNotMatch(s, /lg:pr-\[calc/);
});

test('CustomerMirrorPanel: the summary step comes first, the card is the corner\'s positioning context, and the title row reserves height on request', () => {
  const s = read(P + 'CustomerMirrorPanel.tsx');
  assert.match(s, /orderSummaryStep && \(/);
  assert.ok(s.indexOf('orderSummaryStep.render') < s.indexOf('step?.render('), 'the summary comes first');
  assert.match(s, /relative w-full p-6/);
  assert.match(s, /reserveCornerHeight \? 'sm:min-h-14'/);
});

test('wizardTypes: a step can list extra summary sections after itself', () => {
  assert.match(read(LIB + 'wizardTypes.ts'), /extraSummary\?:/);
});

test('DocumentCaptureActions and useDocumentScan: no automatic scan, one scan generator the host can replace, several uploaded files handed over together', () => {
  const actions = read(P + 'DocumentCaptureActions.tsx');
  assert.doesNotMatch(actions, /autoScanKey/);
  assert.match(actions, /useDocumentScan\(documentType, scanner\)/);
  assert.match(actions, /multiple && onUploadMany && chosen\.length > 1/);
  assert.match(read('src/hooks/useDocumentScan.ts'), /onFile\(await scanner\(new Date\(\), documentType, page\)\)/);
});

test('documentScan names every scan through scannedFileName, and a camera photo is converted to a type a preview can draw', () => {
  assert.match(read(LIB + 'documentScan.ts'), /scannedFileName\(now, documentType\)/);
  assert.match(read(P + 'CameraCaptureButton.tsx'), /previewableCameraPhoto\(photo\)\.then/);
});
