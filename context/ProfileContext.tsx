"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabaseClient"

type Profile = {
  id: string
  username: string | null
  // add other profile fields here later (e.g., streakCount)
}

type ProfileContextType = {
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  refreshProfile: async () => {}
})

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (error) {
      console.log("Failed to fetch profile:", error)
      setProfile(null)
    } else {
      setProfile(profileData as Profile)
    }
    setLoading(false)
  }

  useEffect(() => {
    refreshProfile()

    // listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) setProfile(null)
      else refreshProfile()
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)