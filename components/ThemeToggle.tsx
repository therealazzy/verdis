"use client"

import { useTheme } from "@/context/ThemeContext"
import { Toggle } from "@/components/ui/toggle"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Toggle
      aria-label="Toggle dark mode"
      pressed={theme === "dark"}
      onPressedChange={toggleTheme}
      variant="outline"
    >
      {theme === "dark" ? "☾" : "☼"}
    </Toggle>
  )
}
