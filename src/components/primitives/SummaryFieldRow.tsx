import { Button } from '../ui/button';
import { useState } from 'react';
import type { FormattedSummaryValue } from '../../lib/stepSummary';

/** One label / value pair. A value cut to its first few entries ("a, b, c +2 more") expands to the full list. */
export function SummaryFieldRow({ label, value }: { label: string; value: FormattedSummaryValue }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="stack gap-0.5 py-2 row-rule">
      <dt className="text-fg text-[length:var(--fs-caption)]">{label}</dt>
      <dd className={`summary-value ${value.empty ? 'muted-body' : 'value-text'}`}>
        {value.fullList ? (
          <>
            {expanded ? value.fullList.join(', ') : value.text}{' '}
            <Button variant="tertiary" size="sm" onClick={() => setExpanded((e) => !e)} aria-expanded={expanded}>
              {expanded ? 'Show less' : 'Show all'}
            </Button>
          </>
        ) : (
          value.text
        )}
      </dd>
    </div>
  );
}
