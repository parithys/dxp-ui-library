import type { ReactNode } from 'react';
import type { SummaryField } from './stepSummary';

export interface WizardStep {
  key: string;
  label: string;
  /** Rail icon (SVG path data). Defaults to one inferred from the label. */
  icon?: string;
  /** Heading shown above the step content, when it should differ from the rail label. */
  heading?: string;
  /** A heading that depends on the journey's answers so far (e.g. "Primary SIM Selection" once Multi-SIMs apply). Returns undefined to use `heading` / the label. */
  headingFor?: (values: Record<string, unknown>) => string | undefined;
  /** Small uppercase label above the heading (for example "Configure service"). Optional. */
  eyebrow?: string;
  /** One line of explanatory text under the heading. Optional. */
  subheading?: string;
  /** Extra control(s) at the right of the step's title row, before Customer view (for example a Refresh button). */
  headerAction?: (ctx: { values: Record<string, unknown>; setValue: (field: string, value: unknown) => void }) => ReactNode;
  /**
   * Invisible work this step needs done, mounted for every step the journey currently has - whether it is the one on screen, one the agent
   * has not reached yet, or one passed over by autoPass (which never renders). For a step that fills in its own value on the agent's
   * behalf (the Billing Profile step selects or creates the account). Must render nothing visible.
   */
  headless?: (ctx: { values: Record<string, unknown>; setValue: (field: string, value: unknown) => void }) => ReactNode;
  /** Short secondary line shown under the label in the step list (e.g. "Customer identification"). Optional - omitted steps just show the label. */
  description?: string;
  render: (ctx: {
    values: Record<string, unknown>;
    setValue: (field: string, value: unknown) => void;
    /**
     * Advance to the next step (or submit, on the last one) - the SAME
     * function the footer's own Continue/Save & Finish button calls,
     * unguarded by `isValid` (2026-09-28). For a step that offers its own
     * distinct forward action instead of - not beside - a disabled ordinary
     * Continue, e.g. Eligibility's "Proceed to Approval": that action exists
     * BECAUSE the plain-Continue path is blocked, so calling straight
     * through to `goNext` rather than re-deriving the footer button's gate
     * is correct here, not a bypass of it.
     */
    goNext: () => void;
    /**
     * Jump to an earlier step by its `key` (2026-09-28) - e.g. an "Edit"
     * action on Checkout returning the agent to Plan & Add-ons. Keyed rather
     * than indexed for the same reason the draft-resume logic above is: a
     * step's position can shift under skip(), so a key survives that where a
     * raw index would not. Reaches only steps already visited this session
     * (the same `maxReached` rule the step rail itself enforces) and
     * silently no-ops on an unknown or unreached key, matching the rail's
     * own behaviour for a step it will not let you click.
     */
    goToStepKey: (key: string) => void;
    /** Save the draft order and show a confirmation toast; the caller then navigates away. */
    saveDraft: () => Promise<void>;
    /** Save the draft order and leave the journey (what the header's Save as Draft does). */
    saveAndExit: (comments?: string) => Promise<void>;
    /** Opens the "Abandon this order?" confirmation (what the header's Abandon Order does). */
    requestAbandon: () => void;
  }) => ReactNode;
  /** Return true to auto-skip this step given current draft values (e.g. appointment step skipped for instant activation). */
  skip?: (values: Record<string, unknown>) => boolean;
  /**
   * Return true to have Continue pass OVER this step: it stays in the rail and
   * stays reachable with Back or a rail click (so the agent can return and edit
   * it), but moving forward from the step before does not stop here. Unlike
   * skip(), the step is not removed. Only forward moves pass over it - going
   * Back lands on it, and Continue from it goes on to the next step as normal.
   */
  autoPass?: (values: Record<string, unknown>) => boolean;
  /** The step takes the Selected Add-Ons tray (its count and charge, with remove) in the step card's corner: `catalogue` for the postpaid add-ons, `prepaid` for a pack's. Set by the add-ons step builder, so every journey that uses it gets the tray. */
  addonsTray?: 'catalogue' | 'prepaid' | 'recharge';
  /**
   * What the running Summary panel shows for this step once it is completed: the ordered fields, each read from the
   * draft values. Omit for a step with nothing worth echoing back; a journey with no summary on any step shows no panel.
   */
  summary?: SummaryField[];
  /**
   * Further sections the Summary lists straight after this step, each shown as a step of its own while `when` holds - for what is entered on this step's page
   * but is a step in its own right to the agent (the Secondary Contact, entered on SIM Selection, is listed after it). Edit returns to this step's page.
   */
  extraSummary?: { key: string; label: string; fields: SummaryField[]; when: (values: Record<string, unknown>) => boolean }[];
  /** Return false to block Continue/Save & Finish (e.g. SIM Serial not found/already-assigned per Pattern 11). Defaults to true (no gate) if omitted. */
  isValid?: (values: Record<string, unknown>) => boolean;
  /**
   * Return true while this step is the one moment a customer looks at and
   * acts on the screen directly - e.g. reviewing the T&C summary and signing
   * the CAF (2026-09-28 request: "the first and only step where the
   * customer-facing view is presented"). While true for the CURRENT step,
   * the wizard renders ONLY that step's own content - no rail, no other
   * step's label, no Abandon/Save as Draft, no Back/Continue footer - so
   * nothing about the rest of the journey is visible on a screen handed to a
   * customer. Re-evaluated every render, not a static flag: the SAME 'caf'
   * step is customer-facing while awaiting a signature and agent-facing
   * again the moment one exists, without a step transition in between.
   */
  customerFacing?: (values: Record<string, unknown>) => boolean;
  /**
   * Whether "Save as Draft" is offered while this step is current. Absent: always offered. Customer Verification offers it only once
   * the customer is validated and nothing stops the order, so a half-identified or blocked customer is not saved as a draft.
   */
  canSaveDraft?: (values: Record<string, unknown>) => boolean;
  /**
   * Return true once this step's own condition makes the journey
   * irreversible from here - e.g. the CAF has been signed (2026-09-28: "once
   * CAF is signed, disable/remove Back navigation and prevent all edits").
   * Checked against every step up to and including the current one: once ANY
   * of them reports true, the Back button disappears and the step rail
   * stops accepting clicks entirely, for the rest of the session. Forward-
   * only from that point - Continue is unaffected.
   */
  locksAfter?: (values: Record<string, unknown>) => boolean;
  /** The step's floating bar is taller than the standard one (Recommended Offers' "Start Another Journey" bar): the page leaves room for its height under the card, so the card keeps its margin above it. */
  tallFooter?: boolean;
  /**
   * Return true to move straight on to the next step without the agent
   * pressing Continue - for a step that only REPORTS a result and needs no
   * input, such as Eligibility, whose seven checks either clear or stop the
   * journey.
   *
   * Fires at most ONCE per step per mount. That matters because the agent can
   * still walk back to the step: without the guard they would be bounced
   * forward again the instant they arrived, making Back unusable for every
   * step behind it.
   */
  autoAdvanceWhen?: (values: Record<string, unknown>) => boolean;
  /**
   * Extra content for the LEFT side of the step footer, alongside Back
   * (2026-09-28: Contact's "View eligibility checks" link) - rendered
   * whenever this is the current step, independent of whether Back itself
   * is showing (Contact is step one, so Back never is). A render prop
   * rather than a fixed slot: a step that needs this owns its own state
   * (e.g. the popup's open/closed flag) entirely within whatever it returns.
   */
  footerLeft?: (ctx: { values: Record<string, unknown> }) => ReactNode;
  /**
   * Information that belongs to the page but not to the step's card: shown as plain text just under the card (Payment: the eWallet Balance, which is for
   * reference and is not part of taking the payment).
   */
  belowCard?: (ctx: { values: Record<string, unknown> }) => ReactNode;
  /** A full-width card of the step's own immediately below the page title (the Contact page's Existing Connections banner). Only while this step is the current one. */
  belowTitle?: (ctx: { values: Record<string, unknown> }) => ReactNode;
  /** A card of the step's own in the right-hand column, immediately above the Journey Summary (the Contact page's Existing Connections Summary). Only while this step is the current one. */
  asideAbove?: (ctx: { values: Record<string, unknown> }) => ReactNode;
  /** A card of the step's own just above the step card (Recommended Offers: the Offers & Plans journey cards). It does not take the step's heading or Continue. */
  aboveCard?: (ctx: { values: Record<string, unknown>; setValue: (field: string, value: unknown) => void; goNext: () => void }) => ReactNode;
  /**
   * Replaces the footer's primary Continue button for this step. Receives the
   * default button (already wired to canProceed/submitting) so a step can keep
   * it for some states and swap it for others; `abandon` opens the same
   * confirmation the header's Abandon Order link does.
   */
  primaryAction?: (ctx: {
    values: Record<string, unknown>;
    setValue: (field: string, value: unknown) => void;
    goNext: () => void;
    abandon: (opts?: { hideKeepWorking?: boolean }) => void;
    defaultButton: ReactNode;
  }) => ReactNode;
}
