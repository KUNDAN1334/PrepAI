import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border-[1.5px] px-2.5 py-0.5 text-xs font-bold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-ink bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-ink bg-secondary text-secondary-foreground [a&]:hover:bg-accent",
        destructive:
          "border-ink bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border-ink bg-transparent text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        /* Editorial accent badges — additive, existing variants unchanged. */
        azure: "border-ink bg-azure text-white",
        gold: "border-ink bg-gold text-ink",
        crimson: "border-ink bg-crimson text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
