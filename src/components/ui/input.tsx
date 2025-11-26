import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-brutal-black placeholder:text-brutal-black/50 selection:bg-brutal-pink selection:text-brutal-black border-brutal-black h-12 w-full min-w-0 border-4 bg-white px-4 py-3 text-base shadow-brutal transition-all outline-none font-mono disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-brutal-pink focus-visible:shadow-brutal-lg",
        "aria-invalid:border-brutal-orange",
        className
      )}
      {...props}
    />
  )
}

export { Input }
