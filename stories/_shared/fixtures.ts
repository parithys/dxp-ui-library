// Small fixtures shared by the file stories: a tiny PNG and files built in memory. Nothing here is a real document.
import { userEvent, within } from 'storybook/test';

/** A 1 x 1 pixel PNG, as a data URL - the image fixture every story uses. */
export const PNG_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
/** A minimal PDF, as a data URL (the browser's viewer opens it). */
export const PDF_DATA_URL = 'data:application/pdf;base64,JVBERi0xLjEKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgMjAwIDIwMF0+PmVuZG9iagp0cmFpbGVyPDwvUm9vdCAxIDAgUj4+CiUlRU9G';

const bytesOf = (dataUrl: string) => Uint8Array.from(atob(dataUrl.slice(dataUrl.indexOf(',') + 1)), (c) => c.charCodeAt(0));

/** A small PNG image file. */
export const pngFile = (name = 'front.png') => new File([bytesOf(PNG_DATA_URL)], name, { type: 'image/png' });
/** A small PDF file. */
export const pdfFile = (name = 'letter.pdf') => new File([bytesOf(PDF_DATA_URL)], name, { type: 'application/pdf' });

/** A small JPG-named file (its content is the PNG fixture; upload rules read the name and size). */
export const jpgFile = (name = 'scan.jpg') => new File([bytesOf(PNG_DATA_URL)], name, { type: 'image/jpeg' });

/** A user-event that does NOT filter files by the input's `accept`, so a wrong type reaches the component and its own refusal message shows. */
export const uploader = () => userEvent.setup({ applyAccept: false });

/** Puts a file into the (visually hidden) file input of the element, as choosing it in the file dialog does. */
export async function chooseFile(root: HTMLElement, file: File, label?: string | RegExp) {
  const input = (label ? within(root).getByLabelText(label) : root.querySelector('input[type="file"]')) as HTMLInputElement | null;
  if (!input) throw new Error('No file input found');
  await uploader().upload(input, file);
}
