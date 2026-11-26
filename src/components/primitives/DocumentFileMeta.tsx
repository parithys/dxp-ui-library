import { useEffect, useState } from 'react';
import { fileSizeLabel } from '../../lib/format';
import { pdfPageCountOfFile } from '../../lib/pdfPageCount';

/** "(148 KB)" for a file chosen but not yet attached, with its page count - "(148 KB · 3 pages)" - when it is a PDF whose pages can be counted. An image shows its size only. */
export function DocumentFileMeta({ file }: { file: File }) {
  const [pages, setPages] = useState<{ file: File; count?: number }>();
  useEffect(() => {
    let live = true;
    void pdfPageCountOfFile(file).then((count) => live && setPages({ file, count }));
    return () => {
      live = false;
    };
  }, [file]);
  return <span className="text-muted">({fileSizeLabel(file.size, pages?.file === file ? pages.count : undefined)})</span>;
}
