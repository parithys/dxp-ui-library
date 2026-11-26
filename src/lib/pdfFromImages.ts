/**
 * Combines scanned pages (JPEG images) into one PDF, with no library: each page is a PDF page holding one JPEG (DCTDecode), scaled to fit an A4 page and centred.
 * Used when a flatbed scan has several pages: they are uploaded as one document.
 */
const A4_W = 595;
const A4_H = 842;

/** Width and height of a JPEG, read from its first start-of-frame marker. */
export function jpegSize(b: Uint8Array): { width: number; height: number } {
  if (b[0] !== 0xff || b[1] !== 0xd8) throw new Error('A page is not a JPEG image.');
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = b[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0xff) {
      i += marker === 0xff ? 1 : 2;
      continue;
    }
    const len = (b[i + 2] << 8) | b[i + 3];
    // SOF0-SOF15 except DHT (C4), JPG (C8) and DAC (CC)
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: (b[i + 5] << 8) | b[i + 6], width: (b[i + 7] << 8) | b[i + 8] };
    }
    i += 2 + len;
  }
  throw new Error('The size of a JPEG page could not be read.');
}

export interface PdfPageImage {
  jpeg: Uint8Array;
  width: number;
  height: number;
}

/** The bytes of a PDF with one page per image, in order. */
export function buildPdf(pages: PdfPageImage[]): Uint8Array {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (c: Uint8Array) => {
    chunks.push(c);
    length += c.length;
  };
  const text = (s: string) => push(enc.encode(s));
  const object = (n: number, body: () => void) => {
    offsets[n] = length;
    text(`${n} 0 obj\n`);
    body();
    text('\nendobj\n');
  };
  // Object numbers: 1 catalog, 2 pages, then three per page (page, contents, image).
  const pageObj = (i: number) => 3 + i * 3;
  text('%PDF-1.4\n');
  push(Uint8Array.of(0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a));
  object(1, () => text('<< /Type /Catalog /Pages 2 0 R >>'));
  object(2, () => text(`<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_, i) => `${pageObj(i)} 0 R`).join(' ')}] >>`));
  pages.forEach((pg, i) => {
    const scale = Math.min(A4_W / pg.width, A4_H / pg.height);
    const w = Math.round(pg.width * scale * 100) / 100;
    const h = Math.round(pg.height * scale * 100) / 100;
    const x = Math.round(((A4_W - w) / 2) * 100) / 100;
    const y = Math.round(((A4_H - h) / 2) * 100) / 100;
    const n = pageObj(i);
    object(n, () => text(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_W} ${A4_H}] /Resources << /XObject << /Im0 ${n + 2} 0 R >> >> /Contents ${n + 1} 0 R >>`));
    const content = `q ${w} 0 0 ${h} ${x} ${y} cm /Im0 Do Q`;
    object(n + 1, () => text(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
    object(n + 2, () => {
      text(`<< /Type /XObject /Subtype /Image /Width ${pg.width} /Height ${pg.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.jpeg.length} >>\nstream\n`);
      push(pg.jpeg);
      text('\nendstream');
    });
  });
  const count = 3 + pages.length * 3;
  const xref = length;
  text(`xref\n0 ${count}\n0000000000 65535 f \n`);
  for (let n = 1; n < count; n += 1) text(`${String(offsets[n]).padStart(10, '0')} 00000 n \n`);
  text(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  const out = new Uint8Array(length);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}

/** One PDF file from scanned JPEG page files, in order. */
export async function pdfFromImageFiles(files: File[], fileName: string): Promise<File> {
  const pages: PdfPageImage[] = [];
  for (const f of files) {
    const jpeg = new Uint8Array(await f.arrayBuffer());
    pages.push({ jpeg, ...jpegSize(jpeg) });
  }
  const bytes = buildPdf(pages);
  return new File([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], fileName, { type: 'application/pdf' });
}
