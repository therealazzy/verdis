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

  const isAuthed = !!profile

  return (
    <header className="border-b border-white/10 bg-black/40 backdrop-blur surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <h1 className="text-lg font-bold tracking-wide sm:text-xl">🌱 Verdis</h1>

        <div className="flex items-center gap-3 sm:gap-4">
          <Toggle
            aria-label="Toggle dark mode"
            pressed={theme === "dark"}
            onPressedChange={toggleTheme}
            variant="outline"
          >
            {theme === "dark" ? "☾" : "☼"}
          </Toggle>

          {isAuthed ? (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
              <span className="max-w-[120px] truncate sm:max-w-none">
                {profile?.username || "User"}
              </span>
              <button onClick={logout} className="btn-primary px-3 py-1 text-xs sm:text-sm">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs sm:text-sm text-white/80">
              <div className="flex gap-2 sm:gap-3">
                <a href="/login" className="link-accent">
                  Login
                </a>
                <a href="/signup" className="link-accent">
                  Sign up
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}