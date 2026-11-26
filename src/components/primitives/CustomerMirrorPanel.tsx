import type { WizardStep } from '../../lib/wizardTypes';
import { Card } from '../ui/card';

/**
 * The shared view: the current step drawn in the same container as the operator's step panel - same
 * surface, border, radius, padding and heading styles - so the other person sees the design the operator sees. Only
 * the operator's controls are left out: no share button, no sharing label or outline, no rail or footer.
 * Read-only unless `interactive` (a step that needs the other person to act, such as signing).
 */
export function CustomerMirrorPanel({
  step,
  orderSummaryStep,
  values,
  interactive,
  onSetValue,
  summaryLabel = 'Order Summary',
  reserveCornerHeight = false,
}: {
  step: WizardStep | undefined;
  /** CAF & Signature only: the Checkout step, whose content (the Order Summary) is shown to the customer above the terms and the signing, read-only. */
  orderSummaryStep?: WizardStep;
  values: Record<string, unknown>;
  interactive: boolean;
  onSetValue: (field: string, value: unknown) => void;
  /** The heading of the read-only `orderSummaryStep` section (default "Order Summary"). */
  summaryLabel?: string;
  /** The step puts a control in its title row (for example a language choice): the title row keeps the height for it. */
  reserveCornerHeight?: boolean;
}) {
  return (
    <Card
      className={`relative w-full p-6 ${interactive ? '' : 'inert-region'}`}
    >
      {orderSummaryStep && (
        <section aria-label={summaryLabel} className="mb-8 pb-8 divider-bottom">
          <h2 className="title title-xl mb-4">{summaryLabel}</h2>
          <div className="inert-region">
            {orderSummaryStep.render({
              values,
              setValue: () => {},
              goNext: () => {},
              goToStepKey: () => {},
              saveDraft: async () => {},
              saveAndExit: async () => {},
              requestAbandon: () => {},
            })}
          </div>
        </section>
      )}
      {/* The step's own section, with its own heading: the Order Summary comes first, then this. The step's corner control (the language choice) sits at this section's top right. */}
      <section className="mirror-section">
        {/* sm:pr-48: room at the right, and (CAF & Signature) the height, for the control the step puts in the title row - the language choice - so it never overlaps what follows. */}
        <div className={`mb-4 sm:pr-48 ${reserveCornerHeight ? 'sm:min-h-14' : ''}`}>
          <h2 className="title title-xl">{step?.heading ?? step?.label}</h2>
          {step?.subheading && <p className="text-secondary mt-1">{step.subheading}</p>}
        </div>
        {step?.render({
          values,
          setValue: interactive ? onSetValue : () => {},
          goNext: () => {},
          goToStepKey: () => {},
          saveDraft: async () => {},
          saveAndExit: async () => {},
          requestAbandon: () => {},
        })}
      </section>
    </Card>
  );
}
