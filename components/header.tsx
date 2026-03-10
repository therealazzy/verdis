"use client"

import { useProfile } from "@/context/ProfileContext"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function Header() {
  const { profile } = useProfile()
  const router = useRouter()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="flex justify-between items-center p-4 border-b">
      <h1 className="text-xl font-bold">🌱</h1>
      <nav>
        {profile ? (
          <div className="flex items-center gap-4">
            <span>{profile.username || "User"}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <a href="/login" className="text-blue-500">Login</a>
            <a href="/signup" className="text-blue-500">Sign Up</a>
          </div>
        )}
      </nav>
    </header>
  )
}