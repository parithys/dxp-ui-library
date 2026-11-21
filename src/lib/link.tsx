import { createContext, useContext } from 'react';
import type { AnchorHTMLAttributes, ComponentType } from 'react';

/**
 * How a component of this library draws an in-app link (a DataTable row link). The library knows no router: by default a link is a plain anchor, and an application
 * that has a router supplies its own link component once, near its root, with <LinkProvider link={...}>.
 */
export type DxpLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string; replace?: boolean; state?: unknown };
export type DxpLinkComponent = ComponentType<DxpLinkProps>;

function PlainLink({ to, replace: _replace, state: _state, ...rest }: DxpLinkProps) {
  return <a href={to} {...rest} />;
}

const LinkContext = createContext<DxpLinkComponent>(PlainLink);
export const LinkProvider = LinkContext.Provider;
// oxlint-disable-next-line react/only-export-components -- a context hook beside its provider
export const useLink = (): DxpLinkComponent => useContext(LinkContext);
