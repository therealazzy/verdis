import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type ButtonVariant = "default" | "outline"
type ButtonSize = "default" | "lg"

export type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  className?: string
  disabled?: boolean
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "href" | "disabled">

export function Button({
  variant = "default",
  size = "default",
  href,
  className,
  disabled,
  type,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:pointer-events-none disabled:opacity-50"

  const sizeClasses =
    size === "lg" ? "min-h-[3.25rem] py-3" : "min-h-[2.75rem] py-2"

  const variantClasses =
    variant === "outline"
      ? "border bg-transparent hover:bg-black/5 dark:hover:bg-white/10"
      : "bg-[var(--color-accent)] text-[#1a1a1a] hover:brightness-95"

  const classes = cn(base, sizeClasses, variantClasses, className)

  if (href) {
    // Navigation buttons are rendered as links server-side.
    return (
      <Link
        href={href}
        className={classes}
        aria-disabled={disabled ? "true" : undefined}
        tabIndex={disabled ? -1 : undefined}
        {...(props as unknown as Record<string, unknown>)}
      />
    )
  }

  return (
    <button
      type={type ?? "button"}
      className={classes}
      disabled={disabled}
      {...props}
    />
  )
}

