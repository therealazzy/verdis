"use client"

import { useProfile } from "@/context/ProfileContext"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useTheme } from "@/context/ThemeContext"
import { Toggle } from "@/components/ui/toggle"

export default function Header() {
  const { profile } = useProfile()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="flex justify-between items-center px-6 py-3 border-b border-white/10 bg-black/40 backdrop-blur surface">
      <h1 className="text-xl font-bold tracking-wide">🌱 Verdis</h1>
      <nav className="flex items-center gap-4">
        <Toggle
          aria-label="Toggle dark mode"
          pressed={theme === "dark"}
          onPressedChange={toggleTheme}
          variant="outline"
        >
          {theme === "dark" ? "☾" : "☼"}
        </Toggle>
        {profile ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/80">
              {profile.username || "User"}
            </span>
            <button onClick={logout} className="btn-primary">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <a href="/login" className="link-accent">
              Login
            </a>
            <a href="/signup" className="link-accent">
              Sign Up
            </a>
          </div>
        )}
      </nav>
    </header>
  )
}