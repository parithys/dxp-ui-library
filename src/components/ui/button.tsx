import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Slot } from "radix-ui"

// Themed to the app's own button (Phase 1 of the shadcn/ui migration): every variant and size is the app's semantic class from
// src/ui-components.css - `btn btn-primary btn-md` is exactly what primitives/Button.tsx renders - so the red gradient, the weights, the 12px
// radius, the control heights (--control-h-*, which the tablet rules scale), hover / active / disabled and the tertiary touch target are the
// same CSS, written once, with nothing copied here. No glow, no shadow, no focus ring that the app's button does not have.
//
//   variant   default (the app's primary) | secondary | tertiary (the text link) | destructive | outline (= secondary: the app's bordered
//             Back / Cancel button has always been its ghost-rect alias)
//   size      sm | md | lg ("default" is md, the app's default size) | icon | icon-sm (the app's 36px / 28px icon button, which has no
//             variant of its own: a muted glyph that darkens on hover, as primitives/IconButton.tsx draws it)
//
// The stock names `link` and `ghost` are back (the raw-button migration), themed like the rest, not invented: `link` is the app's red text link (the
// `.link` class: red, underline on hover; the button's own semantic class - link-inline, link-on-dark ... - stays in className and refines it), and
// `ghost` is the borderless, fill-less control whose look the SIZE supplies: `<Button variant="ghost" size="icon" aria-label="...">` is the app's 36px
// muted-glyph icon button. An icon size requires an accessible name (aria-label or aria-labelledby) - the type enforces it.
//
// Not carried over, because the app has no such look: the `xs` sizes and the stock `icon-xs` / `icon-lg`. A look the app does not already have is a
// design decision, not a theming one.
//
// Phase 4 (the app's Button now IS this component): nothing here sizes or restyles an icon inside the button - the stock `[&_svg]:size-4 pointer-events-none
// shrink-0` rules would shrink the 20px icons the app's buttons carry - and `type` defaults to "button" as the app's Button always did (a stock button
// inside a form would submit it).
const buttonVariants = cva(
  "",
  {
    variants: {
      variant: {
        default: "btn btn-primary",
        secondary: "btn btn-secondary",
        outline: "btn btn-secondary",
        destructive: "btn btn-destructive",
        tertiary: "btn btn-tertiary",
        link: "link",
        ghost: "",
      },
      size: {
        sm: "btn-sm",
        md: "btn-md",
        default: "btn-md",
        lg: "btn-lg",
        icon: "btn-icon",
        "icon-sm": "btn-icon btn-icon-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type BoxSize = "sm" | "md" | "default" | "lg"
type IconSize = "icon" | "icon-sm"
type ButtonProps = React.ComponentProps<"button"> &
  Omit<VariantProps<typeof buttonVariants>, "size"> & { asChild?: boolean } & (
    | { size?: BoxSize | null }
    // An icon-only button has no text, so it must be named.
    | ({ size: IconSize } & ({ "aria-label": string } | { "aria-labelledby": string }))
  )

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  type = "button",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  // A text link (tertiary) has no box, so it takes no size - as in the app's own Button; the icon button takes no variant.
  const boxless = variant === "tertiary" || variant === "link"
  const iconOnly = size === "icon" || size === "icon-sm"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant: iconOnly ? null : variant, size: boxless ? null : size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
