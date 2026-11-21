import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

export interface TabStripItem<K extends string = string> {
  key: K;
  label: string;
  /** A count shown in a small badge after the label (red on the selected tab, grey on the others). */
  count?: number;
}

/**
 * The horizontal tab strip - the app's original underline tab bar: labels in a row on a thin rule, the selected one in the
 * accent colour and bold with an accent underline, the others charcoal and regular. The rule is --tab-line-w and the selected underline --tab-active-w (thicker); the rule is an inset shadow on the strip (not a border), so
 * the scroll container does not clip the selected underline that sits on it. Colours are design-system
 * tokens only (accent, fg, and --tab-line-color for the rule, which is --field-card-border). Use it for
 * NAVIGATION and CONTENT tabs - tabs that switch the section or view shown below.
 *
 * `variant` is the intent: "navigation" (the default) is the underline above; "filter" is the segmented frame ("Tab Strip, Filter": a bordered, rounded frame divided by hairlines, the selected option filled) and is
 * ONLY for filter-level tabs - tabs that narrow or re-slice the SAME data shown below. Page-level and section tabs stay the underline. Behaviour, keys and the count badge are identical in both.
 *
 * Each variant looks the same at every depth, inside a tab panel included (see TabLevel.tsx).
 *
 * Since Phase 7 this is the shadcn / Radix Tabs (components/ui/tabs.tsx): arrows / Home / End move between tabs and select them (wrapping), only the
 * selected tab is in the Tab order (WAI-ARIA tabs pattern), and the strip scrolls sideways instead of wrapping. Radix also moves to the first / last tab on
 * PageUp / PageDown.
 */
export function TabStrip<K extends string>({
  items,
  active,
  onChange,
  label,
  variant = 'navigation',
  className = '',
}: {
  items: TabStripItem<K>[];
  active: K | undefined;
  onChange: (key: K) => void;
  /** Accessible name of the strip. */
  label?: string;
  /** "navigation" (default): the underline, to move between sections. "filter": the segmented frame, only for tabs that narrow the data shown below. */
  variant?: 'navigation' | 'filter';
  className?: string;
}) {
  return (
    <Tabs value={active ?? ''} onValueChange={(key) => onChange(key as K)}>
      <TabsList aria-label={label} className={variant === 'filter' ? `tab-strip-filter ${className}` : className}>
        {items.map(({ key, label: text, count }) => (
          <TabsTrigger key={key} value={key}>
            {text}
            {count !== undefined && <span className="tab-count">{count}</span>}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
