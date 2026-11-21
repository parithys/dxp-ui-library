// The documentation block every component's meta carries (parameters.docs.description.component): one fixed set of headings, so each reusable
// component states the same things in the same place - purpose, variants, states, events, usage, validation, accessibility, restrictions.
// The props table (names, types, defaults, required) is generated from the component's own TypeScript types and JSDoc by Storybook's docgen.

export interface ComponentDocs {
  /** What the component is for, in one or two sentences. */
  purpose: string;
  /** Source file, relative to the repository root - the single source of truth. */
  source: string;
  /** The variants the application actually supports (never invented for Storybook). */
  variants?: string[];
  /** The states that apply to it. */
  states?: string[];
  /** Callbacks / events and what they receive. */
  events?: string[];
  /** When to use it, and when not to. */
  usage?: string[];
  /** How validation shows (error text, aria-invalid, when it appears). */
  validation?: string[];
  /** Keyboard, focus, labels, ARIA, contrast. */
  accessibility?: string[];
  /** Device-specific behaviour (Web vs Tablet) and responsive notes. */
  devices?: string[];
  /** Restrictions and limitations. */
  restrictions?: string[];
}

const list = (items?: string[]) => (items?.length ? items.map((i) => `- ${i}`).join('\n') : undefined);

/** Markdown for `parameters.docs.description.component`. Sections with nothing to say are left out, never filled with filler. */
export function componentDocs(d: ComponentDocs): string {
  const sections: [string, string | undefined][] = [
    ['Purpose', d.purpose],
    ['Variants', list(d.variants)],
    ['States', list(d.states)],
    ['Events', list(d.events)],
    ['Usage', list(d.usage)],
    ['Validation', list(d.validation)],
    ['Accessibility', list(d.accessibility)],
    ['Web and Tablet', list(d.devices)],
    ['Restrictions', list(d.restrictions)],
  ];
  const body = sections.filter(([, text]) => text).map(([title, text]) => `**${title}**\n\n${text}`);
  return [...body, `**Source:** \`${d.source}\` - the production component; this story imports it, it does not copy it.`].join('\n\n');
}

/** `parameters` for a meta: the docs block, plus a Storybook docs-page description. */
export const docsParameters = (d: ComponentDocs) => ({ docs: { description: { component: componentDocs(d) } } });
