// The secondary BUTTON look as a class, for the link-styled controls that sit beside the buttons (ProductLinePage's category chips,
// WorkspaceNotYetBuilt's links): the page-tint fill with the standard grey border, bold and flat, going white on hover. Defined once as the semantic
// class `.btn-secondary` (src/ui-components.css) and shared with the shadcn Button's `secondary` variant (components/ui/button.tsx), so a link and a
// button can never drift apart. (This file is what remains of the retired primitives/Button.tsx; the Button itself is components/ui/button.tsx.)
export const SECONDARY_BUTTON_SURFACE = 'btn-secondary';
