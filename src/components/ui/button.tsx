import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "glass bg-white/70 text-gray-900 border border-white/50 hover:bg-white/90 hover:text-gray-900 hover:border-white shadow-lg active:bg-white",
        destructive: "glass bg-red-600 text-white border border-red-500/70 hover:bg-red-700 hover:text-white hover:border-red-600 active:bg-red-800",
        outline: "glass text-gray-900 border border-gray-200/80 hover:bg-white/80 hover:text-gray-900 hover:border-gray-300 active:bg-white",
        secondary: "glass bg-black/10 text-gray-900 border border-black/10 hover:bg-black/20 hover:text-gray-900 hover:border-black/20",
        ghost: "text-gray-800 hover:bg-white/70 hover:text-gray-900 active:bg-white",
        link: "text-blue-700 underline-offset-4 hover:underline hover:text-blue-800",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
