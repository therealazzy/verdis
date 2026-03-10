"use client"

import { useProfile } from "@/context/ProfileContext"

export default function Dashboard() {
  const { profile, loading } = useProfile()

  if (loading) return <div className="p-10">Loading...</div>

  return (
    <div className="p-10">
      <h1 className="text-3xl font-semibold mb-4">
        Welcome, {profile?.username || "User"} 🌱
      </h1>
    </div>
  )
}