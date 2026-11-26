/**
 * How many pages a PDF has, read from its own bytes with no library: the page count the page tree states (`/Type /Pages ... /Count n`, the largest when nested) or, failing that,
 * the number of page objects (`/Type /Page`). A PDF that keeps these inside compressed object streams cannot be read this way and gives undefined - unknown stays unknown, never a guess.
 * Imports nothing else in the library.
 */
export function pdfPageCountOf(bytes: Uint8Array): number | undefined {
  let text = '';
  for (let i = 0; i < bytes.length; i += 8192) text += String.fromCharCode(...bytes.subarray(i, i + 8192));
  const counts = [...text.matchAll(/\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)|\/Count\s+(\d+)[^>]*?\/Type\s*\/Pages/g)].map((m) => Number(m[1] ?? m[2]));
  const treeCount = counts.length > 0 ? Math.max(...counts) : 0;
  const objects = [...text.matchAll(/\/Type\s*\/Page(?![A-Za-z])/g)].length;
  const n = Math.max(treeCount, objects);
  return n > 0 ? n : undefined;
}

/** The page count of a PDF file, or undefined when the file is not a PDF or its pages cannot be counted. */
export async function pdfPageCountOfFile(file: File): Promise<number | undefined> {
  if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') return undefined;
  try {
    return pdfPageCountOf(new Uint8Array(await file.arrayBuffer()));
  } catch {
    return undefined;
  }
}
