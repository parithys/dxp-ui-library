import { useState } from 'react';
import { scanDocument } from '../lib/documentScan';

/**
 * The one way a document is scanned in the UI: runs a scan for a document type (the stand-in in lib/documentScan.ts, or the `scanner` you pass in its place: the real device's output) and hands the file to the caller, with the busy
 * and error state a Scan button needs. `page` is the number of this scan within a multi-page (flatbed) document.
 */
export function useDocumentScan(documentType?: string, scanner: (now: Date, documentType?: string, page?: number) => Promise<File> = scanDocument) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scan = async (onFile: (file: File) => void, page?: number) => {
    setScanning(true);
    setError(null);
    try {
      onFile(await scanner(new Date(), documentType, page));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The scan failed. Try again.');
    } finally {
      setScanning(false);
    }
  };
  return { scanning, error, scan };
}
