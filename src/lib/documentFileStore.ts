// The content of files a user attached during a multi-step flow, kept in memory for the session so they can be viewed and downloaded later.
// Only the metadata (name, size, label) belongs in a saved draft: a file's content can be megabytes, which a session draft store cannot hold.
// After a reload the metadata remains and the content does not (the file then cannot be opened). Imports nothing else in the library.

interface StoredFile {
  dataUrl: string;
  mime: string;
}

const files = new Map<string, StoredFile>();

export const rememberDocumentFile = (id: string, dataUrl: string, mime: string): void => {
  files.set(id, { dataUrl, mime });
};
export const documentFileOf = (id: string): StoredFile | undefined => files.get(id);
export const forgetDocumentFile = (id: string): void => {
  files.delete(id);
};

/** Reads a file into a data URL. */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('The file could not be read.'));
    reader.readAsDataURL(file);
  });
}
