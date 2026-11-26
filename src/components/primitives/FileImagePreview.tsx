import { IconButton } from './IconButton';
import { readFileAsDataUrl } from '../../lib/documentFileStore';
import { TRASH } from '../../assets/icons/index';
import { useConfirmedRemoval } from './useConfirmedRemoval';
import { useEffect, useState } from 'react';

/**
 * The picture in an image file the agent has just scanned, photographed or chosen, shown on the page before it is attached. A file that is not an image (a PDF) shows nothing:
 * its name and size line says what it is. The picture is read from the file in memory; a picture that belongs to an earlier file is never shown for a later one.
 */
export function FileImagePreview({ file, caption }: { file: File | null | undefined; caption?: string }) {
  const [read, setRead] = useState<{ file: File; url: string } | undefined>();
  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) return;
    let cancelled = false;
    readFileAsDataUrl(file)
      .then((url) => {
        if (!cancelled) setRead({ file, url });
      })
      .catch(() => {
        // The preview is a courtesy: the file is still attached by name.
      });
    return () => {
      cancelled = true;
    };
  }, [file]);
  if (!file || read?.file !== file) return null;
  return (
    <figure className="stack-center gap-2">
      <img src={read.url} alt={`Preview of ${file.name}`} className="panel-soft max-h-72 max-w-full object-contain" />
      <figcaption className="caption-secondary">{caption ?? file.name}</figcaption>
    </figure>
  );
}

/** The pages of a multi-page scan, side by side, each captioned with its page number and (given `onDelete`) with a button that deletes that page. */
export function FilePagesPreview({ files, onDelete }: { files: File[]; onDelete?: (index: number) => void }) {
  const { confirmRemoval, dialog: removeDialog } = useConfirmedRemoval();
  if (files.length === 0) return null;
  return (
    <div className="cluster justify-center gap-4">
      {removeDialog}
      {files.map((file, i) => (
        <div key={`${file.name}-${i}`} className="stack-center gap-1">
          <FileImagePreview file={file} caption={`Page ${i + 1} of ${files.length}`} />
          {onDelete && (
            <IconButton icon={TRASH} tone="danger" label={`Delete page ${i + 1}`} onClick={() => confirmRemoval(`Page ${i + 1} (${file.name})`, () => onDelete(i))} />
          )}
        </div>
      ))}
    </div>
  );
}
