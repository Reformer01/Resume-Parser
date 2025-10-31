import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "glass border border-white/30 bg-emerald-500/20 text-white hover:bg-emerald-500/30",
        secondary:
          "glass border border-white/30 bg-amber-500/20 text-white hover:bg-amber-500/30",
        destructive:
          "glass border border-white/30 bg-red-500/20 text-white hover:bg-red-500/30",
        outline: "glass border border-white/30 text-white hover:bg-white/10",
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
