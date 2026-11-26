import { SignaturePad } from './SignaturePad';

/**
 * The standard signature control: a static "Please Sign" label and the
 * signing canvas always on screen below it, with Clear and Save. The pad is disabled until a precondition (e.g. agreeing
 * to the terms) is met, and goes back to disabled - discarding anything drawn - if that is withdrawn. Save hands the
 * signature (a PNG data URL) to `onSave`.
 */
export function SignatureCapture({
  onSave,
  label = 'Please Sign',
  doneLabel = 'Save',
  clearLabel,
  disabled = false,
}: {
  onSave: (dataUrl: string) => void;
  label?: string;
  /** The Save and Clear buttons' words (the signer's language on the signing screen). */
  doneLabel?: string;
  clearLabel?: string;
  /** Keeps the pad disabled until a precondition (e.g. agreeing to the terms) is met. */
  disabled?: boolean;
}) {
  return (
    <div className="mt-3">
      <p className={`title title-sm mb-2 ${disabled ? 'text-fg-2' : ''}`}>{label}</p>
      {/* key: switching between disabled and enabled remounts the pad, which discards anything drawn. */}
      <SignaturePad key={String(disabled)} doneLabel={doneLabel} clearLabel={clearLabel} disabled={disabled} onDone={onSave} />
    </div>
  );
}
