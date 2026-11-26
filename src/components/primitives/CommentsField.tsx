import { Textarea } from './Textarea';

/**
 * A free-text comments box, the terminal step of a guided flow: the label, helper text and placeholder are the caller's words
 * (the defaults are neutral), the value is the caller's state.
 */
export function CommentsField({
  value,
  onChange,
  label = 'Comments',
  helperText = 'Please note down a comment regarding the actions performed.',
  placeholder = 'Enter comments…',
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  placeholder?: string;
}) {
  return <Textarea label={label} helperText={helperText} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />;
}
