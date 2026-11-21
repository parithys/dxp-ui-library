// Layout helpers for stories that show several variants or states at once. They carry no look of their own: they only arrange children with the
// application's own layout classes (ui-components.css: .stack, .cluster, .grid-2-up, .caption-muted ...), so what is shown is the production component.
import type { ReactNode } from 'react';

/** One labelled specimen (a variant or a state) in a matrix. */
export function Specimen({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="stack gap-2">
      <p className="caption-muted">{label}</p>
      {children}
    </div>
  );
}

/** A row of specimens that wraps. */
export function Row({ children }: { children: ReactNode }) {
  return <div className="cluster gap-4 items-start">{children}</div>;
}

/** A column of specimens. */
export function Column({ children }: { children: ReactNode }) {
  return <div className="stack gap-6">{children}</div>;
}

/** Two specimens side by side (e.g. Web and Tablet). */
export function SideBySide({ children }: { children: ReactNode }) {
  return <div className="grid-2-up gap-6 items-start">{children}</div>;
}
