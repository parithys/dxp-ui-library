import { formatBytes } from './format';

/**
 * What a file upload accepts: which file types, how large, and what is said when a file is refused. A product defines its rules once with `uploadRules(...)`
 * and every upload reads them from there, so a limit is changed once.
 */
export interface UploadRules {
  /** The `accept` attribute of the file input. */
  accept: string;
  extensions: readonly string[];
  maxBytes: number;
  /** "PDF or JPG" - the types in words, for helper text and messages. */
  formatsLabel: string;
  /** "2 MB" - the size limit in words. */
  maxLabel: string;
}

export function uploadRules(extensions: readonly string[], maxMb: number, formatsLabel: string): UploadRules {
  return {
    accept: extensions.map((e) => `.${e}`).join(','),
    extensions,
    maxBytes: maxMb * 1024 * 1024,
    formatsLabel,
    maxLabel: `${maxMb} MB`,
  };
}

/** The `accept` attribute of a PDF-or-JPG upload (what a capture control offers when it is given no rules). */
export const DEFAULT_UPLOAD_ACCEPT = '.pdf,.jpg,.jpeg';

/** What is wrong with a file under the rules, or null when it can be uploaded. */
export function uploadFileProblem(file: { name: string; size: number }, r: UploadRules): string | null {
  const ext = /\.([^.]+)$/.exec(file.name)?.[1]?.toLowerCase();
  if (!ext || !r.extensions.includes(ext)) return `${file.name}: only ${r.formatsLabel} files can be uploaded.`;
  if (file.size === 0) return `${file.name}: the file is empty.`;
  if (file.size > r.maxBytes) return `${file.name} is ${formatBytes(file.size)}. The limit is ${r.maxLabel} per file.`;
  return null;
}
