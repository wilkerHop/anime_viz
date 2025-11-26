import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wide transition-all duration-100 disabled:pointer-events-none disabled:opacity-50 outline-none border-4 border-brutal-black active:translate-x-1 active:translate-y-1",
  {
    variants: {
      variant: {
        // Brutal Primary - Pink background
        default: "bg-brutal-pink text-brutal-black shadow-brutal hover:shadow-brutal-sm active:shadow-none",
        
        // Brutal Destructive - Orange background
        destructive:
          "bg-brutal-orange text-brutal-black shadow-brutal hover:shadow-brutal-sm active:shadow-none",
        
        // Brutal Outline - White background with black border
        outline:
          "bg-brutal-white text-brutal-black shadow-brutal hover:shadow-brutal-sm active:shadow-none",
        
        // Brutal Secondary - Cyan background
        secondary:
          "bg-brutal-cyan text-brutal-black shadow-brutal hover:shadow-brutal-sm active:shadow-none",
        
        // Brutal Success - Green background
        success:
          "bg-brutal-green text-brutal-black shadow-brutal hover:shadow-brutal-sm active:shadow-none",
        
        // Brutal Ghost - No background, minimal shadow
        ghost:
          "bg-transparent border-0 text-brutal-black shadow-none hover:bg-brutal-bg",
        
        // Brutal Link - Underlined, no border
        link: "text-brutal-black underline-offset-4 hover:underline border-0 shadow-none",
      },
      size: {
        default: "h-12 px-8 py-3",
        sm: "h-10 px-6 py-2 text-xs",
        lg: "h-14 px-10 py-4 text-base",
        icon: "size-12",
        "icon-sm": "size-10",
        "icon-lg": "size-14",
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
