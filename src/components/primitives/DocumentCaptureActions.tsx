import { useRef } from 'react';
import { Button } from '../ui/button';
import { detectDeviceType, type DeviceType } from '../../lib/deviceType';
import { DEFAULT_UPLOAD_ACCEPT } from '../../lib/documentUploadRules';
import { useDocumentScan } from '../../hooks/useDocumentScan';
import { CameraCaptureButton } from './CameraCaptureButton';

/**
 * How a supporting document is taken, for every document scenario (a number discount's document, a court order, Additional Documents ...), by the device in use:
 *
 *   web              Initiate Scan (the desk scanner) only: no file upload
 *   tablet / mobile  Open Camera (the device's camera takes the place of the scanner) and Upload Document - never "Initiate Scan"
 *
 * A camera capture is handed over like a scan (`onFile`, named scan-{id}-{type}); an upload goes to `onUpload` when given. Additional Documents asks for
 * `uploadOnWeb`: there the web offers Upload Document beside Initiate Scan; a tablet offers Open Camera and Upload Document either way.
 *
 * Whichever is used, the caller gets one `File` and checks it against the shared upload rules exactly as before (type, size); this control only says where the file comes from. The
 * device is the one the journey runs on (lib/deviceType), unless the caller passes it.
 */
export function DocumentCaptureActions({
  onFile,
  hasDocument = false,
  rescan = false,
  scanFirst = false,
  hideCapture = false,
  multiple = false,
  onUploadMany,
  device,
  what = 'document',
  documentType,
  disabled = false,
  disabledTitle,
  accept = DEFAULT_UPLOAD_ACCEPT,
  uploadOnWeb = false,
  onUpload,
  scanner,
}: {
  /** The file taken, by whichever way. */
  onFile: (file: File) => void;
  /** A document is already attached: the upload button reads "Replace Document" (on the web, the scan button reads "Initiate Scan" unless `rescan` is set). */
  hasDocument?: boolean;
  /** The scan button reads "Rescan" (a scan is already held and a new one replaces it). */
  rescan?: boolean;
  /** The scan (web) or camera (tablet) comes first and is the primary action, ahead of Upload Document. Default: Upload first, both secondary. */
  scanFirst?: boolean;
  /** The scan / camera control is not shown (the caller shows its own, e.g. Rescan beside Accept). */
  hideCapture?: boolean;
  /** Upload Document takes several files at once and hands them over together (`onUploadMany`), in the order chosen. */
  multiple?: boolean;
  onUploadMany?: (files: File[]) => void;
  device?: DeviceType;
  /** What the document is, for the controls' accessible names ("supporting document", "court order"). */
  what?: string;
  /** What the document is, as the screen names it ("Passport"): it ends up in the scanned file's name, scan-{id}-{type}.jpg. */
  documentType?: string;
  disabled?: boolean;
  /** Why the controls are disabled (shown as the tooltip). */
  disabledTitle?: string;
  accept?: string;
  /** The web offers Upload Document beside Initiate Scan (a tablet offers Open Camera and Upload Document either way). */
  uploadOnWeb?: boolean;
  /** Where an uploaded file goes, when that differs from a scanned one (default: `onFile`). */
  onUpload?: (file: File) => void;
  /** Where a scan comes from, in place of the built-in stand-in: the real scanner's output as a File. */
  scanner?: (now: Date, documentType?: string, page?: number) => Promise<File>;
}) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const { scanning, error: scanError, scan: runScan } = useDocumentScan(documentType, scanner);
  const kind = device ?? detectDeviceType();
  const take = (input: HTMLInputElement) => {
    const chosen = Array.from(input.files ?? []);
    const file = chosen[0];
    // Cleared so choosing the same file again still fires.
    input.value = '';
    if (!file) return;
    if (multiple && onUploadMany && chosen.length > 1) return onUploadMany(chosen);
    // An uploaded file keeps the name it already has.
    (onUpload ?? onFile)(file);
  };
  const scan = () => void runScan(onFile);
  const capture = hideCapture ? null : (
    <>
      {kind === 'tablet' && (
        <CameraCaptureButton documentType={documentType} ariaLabel={`Open Camera to capture the ${what}`} disabled={disabled} title={disabledTitle} onCapture={onFile} variant={scanFirst ? 'primary' : 'secondary'} />
      )}
      {kind !== 'tablet' && (
        <Button variant={scanFirst ? 'default' : 'secondary'} size="sm" disabled={disabled || scanning} title={disabled ? disabledTitle : undefined} onClick={() => scan()}>
          {scanning ? 'Scanning…' : rescan ? 'Rescan' : 'Initiate Scan'}
        </Button>
      )}
    </>
  );
  const upload =
    kind === 'tablet' || uploadOnWeb ? (
      <>
        <input ref={uploadRef} type="file" accept={accept} multiple={multiple} className="sr-only" tabIndex={-1} aria-label={`Choose the ${what}`} onChange={(e) => take(e.currentTarget)} />
        <Button variant="secondary" size="sm" disabled={disabled} title={disabled ? disabledTitle : undefined} onClick={() => uploadRef.current?.click()}>
          {hasDocument ? 'Replace Document' : 'Upload Document'}
        </Button>
      </>
    ) : null;
  return (
    <>
      {scanFirst ? (
        <>
          {capture}
          {upload}
        </>
      ) : (
        <>
          {kind === 'tablet' && capture}
          {upload}
          {kind !== 'tablet' && capture}
        </>
      )}
      {scanError && (
        <span role="alert" className="text-danger text-[length:var(--fs-caption)]">
          {scanError}
        </span>
      )}
    </>
  );
}
