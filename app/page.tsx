"use client"

import { useProfile } from "@/context/ProfileContext"

export default function Dashboard() {
  const { profile, loading } = useProfile()

  if (loading)
    return (
      <div className="surface-soft rounded-xl p-10 shadow-lg shadow-black/40">
        Loading...
      </div>
    )

  return (
    <div className="surface-soft rounded-xl p-10 shadow-lg shadow-black/40">
      <h1 className="text-3xl font-semibold mb-2">
        Welcome, {profile?.username || "User"} 🌱
      </h1>
      <p className="text-sm text-white/70">
        Settle in, breathe, and focus. This space is yours.
      </p>
    </div>
  )
}