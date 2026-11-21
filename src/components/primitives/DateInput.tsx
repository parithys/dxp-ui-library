import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ChangeEvent, ComponentProps, FocusEvent, KeyboardEvent } from 'react';
import { Button } from '../ui/button';
import { Icon } from './Icon';
import { Input } from './Input';
import { Select } from './Select';
import { CALENDAR_ICON, CHEVRON_LEFT, CHEVRON_RIGHT, CLEAR_ICON } from '../../assets/icons';
import { popoverSide, visibleBand, type PopoverSide } from '../../lib/popoverPlacement';
import {
  MONTH_NAMES, WEEKDAY_NAMES, addDays, addMonths, displayDate, inRange, monthGrid, parseDmy, parseIso, tidyDmy, toDmy, toIso, compareYmd,
  type YmdParts,
} from '../../lib/dateField';

// The app's date field: the date is typed (DD/MM/YYYY) or picked from the calendar opened by the icon at the field's right edge. Every date the agent
// enters uses it, so entering by hand and picking from a calendar are always both there, on every device.
//
// The value is stored either as the typed text ('dmy', the default: what is typed is what is stored, tidied on blur) or as an ISO date ('iso': the field
// stores YYYY-MM-DD, or '' while what is typed is not yet a date). Either way `onChange` receives an event whose target.value is the stored value, so a
// call site reads it as it read a text field or a native date input.

type InputProps = ComponentProps<typeof Input>;

export interface DateInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type' | 'min' | 'max' | 'defaultValue' | 'inputMode' | 'maxLength' | 'trailingAddon'> {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  /** How the value is stored: the typed DD/MM/YYYY text, or an ISO date. */
  format?: 'dmy' | 'iso';
  /** The earliest and latest date the calendar offers (and a typed date must fall between), as the field stores them. */
  min?: string;
  max?: string;
  /** Dates the calendar switches off (and a typed one is refused) inside the range, given as the field stores them, e.g. weekends or holidays. */
  isDateDisabled?: (date: string) => boolean;
  /** Whether a filled, editable field offers a clear button. Default: yes unless the field is required (a required date is replaced, not emptied). */
  clearable?: boolean;
}

const MIN_YEAR = 1900;
const YEARS_AHEAD = 30;
const synth = (value: string) => ({ target: { value } }) as ChangeEvent<HTMLInputElement>;
const todayParts = (): YmdParts => {
  const t = new Date();
  return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() };
};
const bound = (stored: string | undefined, format: 'dmy' | 'iso') => (format === 'iso' ? parseIso(stored) : parseDmy(stored));
const sameDay = (a: YmdParts, b?: YmdParts) => Boolean(b) && compareYmd(a, b as YmdParts) === 0;
const label = (d: YmdParts) => `${d.d} ${MONTH_NAMES[d.m - 1]} ${d.y}`;

/** The month grid under the field: month and year choosers, the days (arrow keys move by day and week, Page Up / Down by month), and the days outside the range switched off. */
function Calendar({ selected, min, max, isDisabled, onPick, onClose }: { selected?: YmdParts; min?: YmdParts; max?: YmdParts; isDisabled?: (d: YmdParts) => boolean; onPick: (d: YmdParts) => void; onClose: () => void }) {
  const today = todayParts();
  // Below the field when the calendar fits there, else above it (else the roomier side): measured against what can be seen - the viewport, a
  // scrolling container or drawer that clips it, and the action bar fixed over the bottom of the page. Decided before the first paint, so it
  // never flashes in the wrong place, and again if the window is resized while it is open.
  const panel = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState<PopoverSide>('below');
  useLayoutEffect(() => {
    const place = () => {
      const el = panel.current;
      const field = el?.parentElement;
      if (!el || !field) return;
      const band = visibleBand(field);
      const r = field.getBoundingClientRect();
      setSide(popoverSide({ above: r.top - band.top, below: band.bottom - r.bottom }, el.offsetHeight + 8));
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, []);
  const [focus, setFocus] = useState<YmdParts>(selected ?? (inRange(today, min, max) ? today : min ?? max ?? today));
  const moved = useRef(false);
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());
  const keyOf = (d: YmdParts) => `${d.y}-${d.m}-${d.d}`;

  useEffect(() => {
    if (moved.current) dayRefs.current.get(keyOf(focus))?.focus();
  }, [focus]);

  const go = (next: YmdParts) => {
    moved.current = true;
    setFocus(next);
  };
  const onKey = (e: KeyboardEvent) => {
    const step: Record<string, () => YmdParts> = {
      ArrowLeft: () => addDays(focus, -1),
      ArrowRight: () => addDays(focus, 1),
      ArrowUp: () => addDays(focus, -7),
      ArrowDown: () => addDays(focus, 7),
      PageUp: () => addMonths(focus, -1),
      PageDown: () => addMonths(focus, 1),
    };
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    } else if (step[e.key]) {
      e.preventDefault();
      go(step[e.key]());
    }
  };

  const firstYear = Math.min(min?.y ?? MIN_YEAR, focus.y);
  const lastYear = Math.max(max?.y ?? today.y + YEARS_AHEAD, focus.y);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => String(firstYear + i));
  const cells = monthGrid(focus.y, focus.m);

  return (
    <div ref={panel} className={`date-panel ${side === 'above' ? 'date-panel-above' : ''}`} data-side={side} role="dialog" aria-label="Choose date" onKeyDown={onKey}>
      <div className="row-between gap-1 mb-2">
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Previous month" onClick={() => go(addMonths(focus, -1))}>
          <Icon path={CHEVRON_LEFT} className="size-4" />
        </Button>
        <div className="row gap-1">
          <Select aria-label="Month" options={MONTH_NAMES.map((n, i) => ({ value: String(i + 1), label: n }))} value={String(focus.m)} onChange={(e) => go({ ...focus, d: 1, m: Number(e.target.value) })} />
          <Select aria-label="Year" options={years.map((y) => ({ value: y, label: y }))} value={String(focus.y)} onChange={(e) => go({ ...focus, d: 1, y: Number(e.target.value) })} />
        </div>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Next month" onClick={() => go(addMonths(focus, 1))}>
          <Icon path={CHEVRON_RIGHT} className="size-4" />
        </Button>
      </div>
      <div className="date-grid" role="grid" aria-label={`${MONTH_NAMES[focus.m - 1]} ${focus.y}`}>
        {WEEKDAY_NAMES.map((n) => (
          <span key={n} role="columnheader" className="date-weekday">{n}</span>
        ))}
        {cells.map((d) => {
          const inMonth = d.m === focus.m;
          const allowed = inRange(d, min, max) && !isDisabled?.(d);
          const chosen = sameDay(d, selected);
          return (
            <button
              key={keyOf(d)}
              ref={(el) => {
                if (el) dayRefs.current.set(keyOf(d), el);
                else dayRefs.current.delete(keyOf(d));
              }}
              type="button"
              role="gridcell"
              disabled={!allowed}
              aria-selected={chosen}
              aria-current={sameDay(d, today) ? 'date' : undefined}
              aria-label={label(d)}
              tabIndex={sameDay(d, focus) ? 0 : -1}
              onClick={() => onPick(d)}
              className={`date-day ${chosen ? 'date-day-chosen' : inMonth ? '' : 'date-day-outside'} ${sameDay(d, today) && !chosen ? 'date-day-today' : ''}`}
            >
              {d.d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const DATE_WATERMARK = 'DD/MM/YYYY';

export function DateInput({ value, onChange, format = 'dmy', min, max, isDateDisabled, clearable, onBlur, disabled, readOnly, required, error, id, ...rest }: DateInputProps) {
  const autoId = useId();
  const inputId = id ?? `date-${autoId}`;
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(() => displayDate(value, format));
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const [touched, setTouched] = useState(false);
  const minDate = bound(min, format);
  const maxDate = bound(max, format);

  // An ISO field keeps what is being typed while it still agrees with the stored value; once the stored value is changed from outside (the calendar, a
  // reset, a draft restored) the field shows that value instead.
  const typedDate = parseDmy(tidyDmy(typed));
  const agrees = (typedDate ? toIso(typedDate) : '') === (value ?? '');
  const shown = format === 'dmy' ? value : agrees ? typed : displayDate(value, 'iso');
  const selected = format === 'dmy' ? parseDmy(tidyDmy(value)) : parseIso(value);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);

  const typeIn = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value.replace(/[^\d/.\-\s]/g, '');
    if (format === 'dmy') return onChange(synth(text));
    setTyped(text);
    const parsed = parseDmy(tidyDmy(text));
    onChange(synth(parsed ? toIso(parsed) : ''));
  };
  const leave = (e: FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    if (onBlur) onBlur(e);
    else if (format === 'dmy') {
      const tidy = tidyDmy(e.target.value);
      if (tidy !== e.target.value) onChange(synth(tidy));
    }
    if (format === 'iso') setTyped(tidyDmy(typed));
  };
  const pick = (d: YmdParts) => {
    setTyped(toDmy(d));
    onChange(synth(format === 'iso' ? toIso(d) : toDmy(d)));
    setOpen(false);
    trigger.current?.focus();
  };
  const clear = () => {
    setTyped('');
    onChange(synth(''));
    field.current?.focus();
  };
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  // The field's own message, for a caller that passes none: a required date left empty, text that is not a date, a date outside the range or switched off.
  const stored = (d: YmdParts) => (format === 'iso' ? toIso(d) : toDmy(d));
  const entered = parseDmy(tidyDmy(shown));
  const problem = ((): string | undefined => {
    if (disabled || readOnly) return undefined;
    if (!shown.trim()) return required && touched ? 'Enter the date.' : undefined;
    if (!entered) return touched || shown.length >= 10 ? 'Enter a valid date.' : undefined;
    if (minDate && compareYmd(entered, minDate) < 0) return `Enter a date on or after ${toDmy(minDate)}.`;
    if (maxDate && compareYmd(entered, maxDate) > 0) return `Enter a date on or before ${toDmy(maxDate)}.`;
    if (isDateDisabled?.(stored(entered))) return 'This date is not available.';
    return undefined;
  })();
  const canClear = (clearable ?? !required) && !disabled && !readOnly && shown !== '';

  const picker = (
    <span className="row gap-1">
      {canClear && (
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Clear date" onClick={clear}>
          <Icon path={CLEAR_ICON} className="size-4" />
        </Button>
      )}
    <Button
      ref={trigger}
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Choose date"
      aria-haspopup="dialog"
      aria-expanded={open}
      disabled={disabled || readOnly}
      onClick={() => setOpen((o) => !o)}
    >
      <Icon path={CALENDAR_ICON} className="size-5" />
    </Button>
    </span>
  );

  return (
    <div ref={wrap} className="relative">
      <Input
        {...rest}
        ref={field}
        id={inputId}
        value={shown}
        required={required}
        error={error ?? problem}
        watermark={DATE_WATERMARK}
        inputMode="numeric"
        maxLength={10}
        disabled={disabled}
        readOnly={readOnly}
        onChange={typeIn}
        onBlur={leave}
        trailingAddon={picker}
      />
      {open && <Calendar selected={selected} min={minDate} max={maxDate} isDisabled={isDateDisabled ? (d) => isDateDisabled(stored(d)) : undefined} onPick={pick} onClose={close} />}
    </div>
  );
}
