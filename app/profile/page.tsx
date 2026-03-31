"use client"

import { useEffect, useMemo, useState } from "react"
import { useProfile } from "@/context/ProfileContext"
import { supabase } from "@/lib/supabaseClient"

type SessionStats = {
  completedSessions: number
  totalMinutes: number
}

export default function ProfilePage() {
  const { profile, loading, refreshProfile } = useProfile()
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [usernameInput, setUsernameInput] = useState("")
  const [savingName, setSavingName] = useState(false)
  const [nameMessage, setNameMessage] = useState("")
  const [isEditingName, setIsEditingName] = useState(false)

  useEffect(() => {
    if (profile) {
      setUsernameInput(profile.username || "")
    }
  }, [profile])

  useEffect(() => {
    const loadStats = async () => {
      if (!profile) return
      setLoadingStats(true)

      const { data, error } = await supabase
        .from("sessions")
        .select("duration_minutes, completed")
        .eq("user_id", profile.id)

      if (error || !data) {
        console.error("Failed to load session stats", error)
        setStats({ completedSessions: 0, totalMinutes: 0 })
        setLoadingStats(false)
        return
      }

      const completed = data.filter((s) => s.completed)
      const completedSessions = completed.length
      const totalMinutes = completed.reduce(
        (sum, s) => sum + (s.duration_minutes ?? 0),
        0,
      )

      setStats({ completedSessions, totalMinutes })
      setLoadingStats(false)
    }

    if (!loading && profile) {
      void loadStats()
    }
  }, [profile, loading])

  const totalHours = useMemo(
    () => (stats ? (stats.totalMinutes || 0) / 60 : 0),
    [stats],
  )

  const saveUsername = async () => {
    if (!profile) return
    const nextUsername = usernameInput.trim()
    if (!nextUsername) {
      setNameMessage("Username cannot be empty.")
      return
    }

    setSavingName(true)
    setNameMessage("")

    const { error } = await supabase
      .from("profiles")
      .update({ username: nextUsername })
      .eq("id", profile.id)

    if (error) {
      console.error("Failed to update username", error)
      setNameMessage("Failed to update username.")
      setSavingName(false)
      return
    }

    await refreshProfile()
    setNameMessage("Username updated.")
    setIsEditingName(false)
    setSavingName(false)
  }

  if (loading) {
    return (
      <div className="surface-soft rounded-xl p-10 shadow-lg shadow-black/40 w-full max-w-lg">
        Loading profile...
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="surface-soft rounded-xl p-10 shadow-lg shadow-black/40 w-full max-w-lg text-center text-sm text-white/80">
        You&apos;re not logged in.
        <div className="mt-4 flex justify-center gap-4">
          <a href="/login" className="link-accent">
            Login
          </a>
          <a href="/signup" className="link-accent">
            Sign up
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-stretch gap-6 px-4 py-6 sm:px-6 max-w-5xl mx-auto w-full">
      <div className="surface-soft rounded-xl p-8 sm:p-10 shadow-lg shadow-black/40 w-full max-w-lg mx-auto min-h-[320px] flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Profile</h2>
          <p className="text-xs text-white/70 mb-6">
            Overview of your focus journey.
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs uppercase tracking-wide text-white/60">
                Username
              </span>
              {!isEditingName ? (
                <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:items-center">
                  <div className="text-lg font-medium">
                    {profile.username || "User"}
                  </div>
                  <button
                    onClick={() => {
                      setUsernameInput(profile.username || "")
                      setNameMessage("")
                      setIsEditingName(true)
                    }}
                    className="px-3 py-1.5 rounded-md border border-white/20 text-sm text-white/80 hover:bg-white/5"
                  >
                    Change username
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:items-center">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full sm:w-auto rounded-md border border-white/20 bg-transparent px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/60"
                    placeholder="Enter username"
                  />
                  <button
                    onClick={saveUsername}
                    disabled={savingName}
                    className="btn-primary px-3 py-1.5 text-sm disabled:opacity-60"
                  >
                    {savingName ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false)
                      setUsernameInput(profile.username || "")
                      setNameMessage("")
                    }}
                    disabled={savingName}
                    className="px-3 py-1.5 rounded-md border border-white/20 text-sm text-white/80 hover:bg-white/5 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="mt-1 text-xs text-white/70 min-h-4">
                {nameMessage}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[11px] uppercase tracking-wide text-white/60">
                  Current streak
                </span>
                <div className="mt-1 text-base font-medium">
                  {/* Placeholder for streak value */}
                  --
                </div>
                <p className="mt-1 text-[11px] text-white/60">
                  Consecutive days you&apos;ve focused.
                </p>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wide text-white/60">
                  Best streak
                </span>
                <div className="mt-1 text-base font-medium">--</div>
                <p className="mt-1 text-[11px] text-white/60">
                  Longest run you&apos;ve ever done.
                </p>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[11px] uppercase tracking-wide text-white/60">
                  Completed sessions
                </span>
                <div className="mt-1 text-base font-medium">
                  {loadingStats ? "…" : stats?.completedSessions ?? 0}
                </div>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wide text-white/60">
                  Focus hours
                </span>
                <div className="mt-1 text-base font-medium">
                  {loadingStats ? "…" : totalHours.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-[11px] text-white/55">
          Session stats include both focus and marathon timers when fully
          completed.
        </div>
      </div>
    </div>
  )
}

