"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { Toggle } from "@/components/ui/toggle"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

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
