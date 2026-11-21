import type { ComponentProps } from 'react';
import { Switch as SwitchPrimitive } from 'radix-ui';

/**
 * The app's on/off switch, on the Radix switch (role="switch": state in aria-checked / data-state, reported as a boolean through `onCheckedChange`). The look is the `switch` /
 * `switch-thumb` classes in src/ui-components.css. Give it an accessible name: an aria-label, or wrap it in a label.
 */
export function Switch({ className = '', ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root data-slot="switch" className={`switch ${className}`.trim()} {...props}>
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className="switch-thumb" />
    </SwitchPrimitive.Root>
  );
}
