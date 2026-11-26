import { StatusPortal } from './StatusSlot';
import { Icon } from './Icon';
import { CROSS } from '../../assets/icons/index';

/**
 * A scan that could not be completed, laid out as what happened, what to do next and any condition that applies - instead of one
 * bulleted list of red text. The wording is the caller's: first line = what happened (the title), the lines after it = what to do, and the
 * last line (when there are three or more) = the condition. One line renders as the title alone. role="alert" so the failure is announced:
 * the agent's attention is on the physical reader, not the screen.
 * The same card as every other failed result (ui-components.css .eligibility-alert, hard stop): a solid red icon tile, a bold title, full-strength body text.
 */
export function ScanFailureNotice({ lines }: { lines: string[] }) {
  const [what, ...rest] = lines;
  const condition = rest.length >= 2 ? rest[rest.length - 1] : undefined;
  const next = condition ? rest.slice(0, -1) : rest;
  return (
    <StatusPortal>
    <div role="alert" className="eligibility-alert eligibility-alert-hard-stop">
      <span className="eligibility-alert-icon" aria-hidden="true">
        <Icon path={CROSS} className="" />
      </span>
      <div className="min-w-0 flex-1 stack gap-1">
        <p className="title title-md leading-snug">{what}</p>
        {next.map((line) => (
          <p key={line} className="text-fg text-[length:var(--fs-body)]">
            {line}
          </p>
        ))}
        {condition && <p className="caption-muted">{condition}</p>}
      </div>
    </div>
    </StatusPortal>
  );
}
