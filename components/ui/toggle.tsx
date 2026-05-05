"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Variant = "default" | "outline"

interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  variant?: Variant
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      pressed,
      onPressedChange,
      variant = "default",
      onClick,
      ...props
    },
    ref,
  ) => {
    const [internalPressed, setInternalPressed] = React.useState(false)
    const isControlled = pressed !== undefined
    const currentPressed = isControlled ? pressed : internalPressed

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
      const next = !currentPressed
      if (!isControlled) {
        setInternalPressed(next)
      }
      onPressedChange?.(next)
      onClick?.(event)
    }

    return (
      <button
        type="button"
        ref={ref}
        data-state={currentPressed ? "on" : "off"}
        aria-pressed={currentPressed}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "h-9 w-9",
          variant === "outline" &&
            "border border-[color:var(--color-border-soft)] bg-transparent text-[color:var(--color-accent)] hover:bg-black/5 dark:hover:bg-white/10 data-[state=on]:bg-[color:var(--color-accent)]/15",
          variant === "default" &&
            "bg-white/10 text-white/80 data-[state=on]:bg-white/20",
          className,
        )}
        onClick={handleClick}
        {...props}
      />
    )
  },
)

Toggle.displayName = "Toggle"

export { Toggle }

