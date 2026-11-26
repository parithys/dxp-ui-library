/**
 * A scan from the desk scanner, as a file. The scanner is not integrated yet (there is no scanner service to call from a browser), so the scan is a stand-in: one A4-proportioned
 * JPEG page stamped "Scanned document" with the time, small enough to pass the upload rules. It is the one place to replace with the real scanner's output; every
 * "Initiate Scan" control reads its file from here.
 *
 * Every scanned (or camera-captured) document is named scan-{scan id}-{document type}.{file type} - the scan id is the time it was taken (yyyyMMddHHmmss), the
 * type is what the document is, as the screen names it ("Passport" -> scan-20261108111905-passport.jpg). One definition, `scannedFileName`, for every surface.
 */
export function scannedFileName(now: Date, documentType: string | undefined, fileType = 'jpg'): string {
  const stamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const type = (documentType ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `scan-${stamp}${type ? `-${type}` : ''}.${fileType}`;
}

/** The file type (extension) of a captured image, from its MIME type: image/jpeg -> jpg. */
export const fileTypeOfMime = (mime: string): string => (mime.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg').replace(/[^a-z0-9]/g, '') || 'jpg';

export async function scanDocument(now: Date = new Date(), documentType?: string, page?: number): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 620;
  canvas.height = 877;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Scanning is not available in this browser.');
  // The page is drawn in the design tokens' colours (the canvas cannot take var()).
  const tokens = getComputedStyle(document.documentElement);
  const token = (name: string) => tokens.getPropertyValue(name).trim() || 'currentColor';
  ctx.fillStyle = token('--paper');
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = token('--field-card-border');
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
  ctx.fillStyle = token('--fg');
  ctx.font = '600 28px sans-serif';
  ctx.fillText('Scanned document', 50, 90);
  ctx.font = '16px sans-serif';
  ctx.fillText(now.toISOString().replace('T', ' ').slice(0, 19), 50, 125);
  // A scan of a multi-page (flatbed) document says which scan of it this is (a deleted page does not give its number back).
  if (page !== undefined) ctx.fillText(`Scan ${page}`, 50, 150);
  ctx.fillStyle = token('--icon-tile-bg');
  for (let y = 180; y < 800; y += 34) ctx.fillRect(50, y, canvas.width - 100, 10);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
  if (!blob) throw new Error('The scan could not be read.');
  return new File([blob], scannedFileName(now, documentType), { type: 'image/jpeg' });
}

/**
 * A camera photo as a file every preview can draw: a JPEG or PNG stays as it is; a photo with no type (some tablets report none) is taken as a JPEG, and a format a browser cannot draw
 * in an image tag (HEIC / HEIF from an iPad, WebP) is re-encoded to JPEG through the browser's own decoder. If it cannot be decoded the photo is kept as it is.
 */
export async function previewableCameraPhoto(photo: File): Promise<File> {
  const type = photo.type || 'image/jpeg';
  if (type === 'image/jpeg' || type === 'image/png') return photo.type ? photo : new File([photo], photo.name, { type });
  try {
    const bitmap = await createImageBitmap(photo);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    return blob ? new File([blob], photo.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }) : photo;
  } catch {
    return photo;
  }
}
