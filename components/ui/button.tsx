import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/60 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-8px_rgba(20,18,14,0.55)] active:translate-y-0 active:shadow-none",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30",
        outline:
          "border-[1.5px] border-ink bg-white text-ink hover:bg-ink/[0.06]",
        secondary:
          "border-[1.5px] border-ink bg-secondary text-secondary-foreground hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-crimson underline-offset-4 hover:underline",
        /**
         * Signature editorial button: white face, hard ink border and an offset
         * shadow that collapses on press. Additive — existing variants unchanged.
         */
        brutal:
          "border-2 border-ink bg-white text-ink shadow-[3px_3px_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--ink)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_var(--ink)]",
        accent:
          "bg-crimson text-white hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-8px_rgba(232,23,74,0.6)] active:translate-y-0 active:shadow-none",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-[10px] px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
