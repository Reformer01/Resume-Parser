import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from '../../lib/utils';

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

export interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

export interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ value, onValueChange, children }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
      <div ref={ref} className="relative">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            if (child.type === SelectTrigger) {
              return React.cloneElement(child as React.ReactElement<any>, {
                onClick: () => setIsOpen(!isOpen),
                isOpen,
                value,
              })
            }
            if (child.type === SelectContent && isOpen) {
              return React.cloneElement(child as React.ReactElement<any>, {
                onValueChange: (newValue: string) => {
                  onValueChange?.(newValue)
                  setIsOpen(false)
                },
              })
            }
          }
          return child
        })}
      </div>
    )
  }
)
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps & { isOpen?: boolean; value?: string }>(
  ({ className, children, isOpen, ...props }, ref) => {
    return (
      <button
        type="button"
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return <span className="text-slate-500">{placeholder}</span>
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps & { onValueChange?: (value: string) => void }>(
  ({ className, children, onValueChange, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-slate-200 bg-white text-sm shadow-md",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === SelectItem) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onClick: () => onValueChange?.(child.props.value),
            })
          }
          return child
        })}
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps & { onClick?: () => void }>(
  ({ className, children, onClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className
        )}
        onClick={onClick}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-slate-900 opacity-0" />
        </span>
        {children}
      </div>
    )
  }
)
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
