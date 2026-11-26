import { useRef } from 'react';
import { Button } from '../ui/button';
import { Icon } from './Icon';
import { CAMERA_ICON } from '../../assets/icons/index';
import { fileTypeOfMime, previewableCameraPhoto, scannedFileName } from '../../lib/documentScan';

/**
 * "Open Camera": a tablet's way to capture a document in place of the desk scanner ("Initiate Scan" is web-only). Opens the device's rear camera
 * (`capture="environment"`; a browser without a camera offers its file picker instead) and hands over the photo as ONE File, named like a scan
 * (scan-{timestamp}-{type}.{ext}) so a capture reads the same as a scanned page wherever the journey shows or stores it. The caller checks the file
 * (type, size) exactly as it checks an upload. Used by every capture control (DocumentCaptureActions, IdFileUpload), never on its own in a screen.
 */
export function CameraCaptureButton({
  onCapture,
  documentType,
  label = 'Open Camera',
  ariaLabel,
  disabled = false,
  title,
  variant = 'secondary',
}: {
  onCapture: (file: File) => void;
  /** What the document is ("Passport", "Court Order"): it ends up in the captured file's name. */
  documentType?: string;
  label?: string;
  /** The accessible name, when the visible label alone does not say which document or side ("Open Camera for the front side"). It starts with the label. */
  ariaLabel?: string;
  disabled?: boolean;
  /** Why the button is disabled (the tooltip). */
  title?: string;
  /** 'primary' makes it the filled main action beside an upload. */
  variant?: 'secondary' | 'primary';
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const photo = e.currentTarget.files?.[0];
          // Cleared so a second capture straight after still fires.
          e.currentTarget.value = '';
          if (!photo) return;
          // The photo handed over is the real capture, in a type the preview can draw.
          void previewableCameraPhoto(photo).then((ok) => onCapture(new File([ok], scannedFileName(new Date(), documentType, fileTypeOfMime(ok.type)), { type: ok.type })));
        }}
      />
      <Button variant={variant === 'primary' ? 'default' : 'secondary'} size="sm" className="shrink-0" disabled={disabled} title={disabled ? title : undefined} aria-label={ariaLabel} onClick={() => input.current?.click()}>
        <Icon path={CAMERA_ICON} className="size-4" />
        {label}
      </Button>
    </>
  );
}
