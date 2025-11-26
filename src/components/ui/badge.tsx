import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border-3 border-brutal-black px-3 py-1 text-xs font-bold uppercase tracking-wide transition-all shadow-brutal-sm",
  {
    variants: {
      variant: {
        default: "bg-brutal-pink text-brutal-black",
        secondary: "bg-brutal-cyan text-brutal-black",
        success: "bg-brutal-green text-brutal-black",
        warning: "bg-brutal-yellow text-brutal-black",
        purple: "bg-brutal-purple text-brutal-white",
        orange: "bg-brutal-orange text-brutal-black",
        outline: "bg-white text-brutal-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
