import type { ButtonHTMLAttributes } from 'react';
import { Button } from '../ui/button';
import { Icon } from './Icon';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** SVG path data, as for <Icon>. */
  icon: string;
  /** What the button does. Required: an icon alone is not a name. */
  label: string;
  /** `danger` turns the hover colour red, for remove/delete. */
  tone?: 'default' | 'danger';
  /** Draws the card border and fill (the kebab / "more actions" look). */
  bordered?: boolean;
  /** sm = compact glyph button inline with text; md = 36px control. */
  size?: 'sm' | 'md';
}

/**
 * The one icon-only button: a labelled, keyboard-reachable control with the app's focus ring and a 36px hit area (28px
 * `sm`). Use it for download / print / copy / remove / more-actions. For closing a dialog use CloseButton.
 */
export function IconButton({ icon, label, tone = 'default', bordered = false, size = 'md', className = '', type = 'button', ...rest }: IconButtonProps) {
  // The shadcn Button's icon sizes are .btn-icon (36px) / .btn-icon + .btn-icon-sm (28px); the modifiers are .btn-icon-danger and .btn-icon-bordered
  // (src/ui-components.css). This wrapper keeps what the Button does not know: the required accessible label, the tone and the glyph size.
  const modifiers = `${tone === 'danger' ? 'btn-icon-danger' : ''} ${bordered ? 'btn-icon-bordered' : ''}`;
  return (
    <Button
      type={type}
      size={size === 'sm' ? 'icon-sm' : 'icon'}
      aria-label={label}
      className={`${modifiers} ${className}`}
      {...rest}
    >
      <Icon path={icon} className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
    </Button>
  );
}
