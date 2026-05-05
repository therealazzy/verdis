import { cache } from "react"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type Profile = {
  id: string
  username: string | null
}

export type GardenTile = {
  date: string
  plant_stage: number
  plant_type: string
}

export const getAuthProfile = cache(async () => {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", user.id)
    .single()

  return (profile ?? { id: user.id, username: null }) as Profile
})

export async function getSessionStats(userId: string) {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("sessions")
    .select("duration_minutes, completed")
    .eq("user_id", userId)

  const sessions = data ?? []
  const completed = sessions.filter((session) => session.completed)
  const totalMinutes = completed.reduce(
    (sum, session) => sum + (session.duration_minutes ?? 0),
    0,
  )

  return {
    completedSessions: completed.length,
    totalMinutes,
  }
}

export async function getGardenData(userId: string) {
  const supabase = await createSupabaseServerClient()
  const today = new Date().toISOString().slice(0, 10)

  const [{ data: todayTile }, { data: historyTiles }] = await Promise.all([
    supabase
      .from("garden_tiles")
      .select("plant_stage")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle(),
    supabase
      .from("garden_tiles")
      .select("date, plant_stage, plant_type")
      .eq("user_id", userId)
      .lt("date", today)
      .order("date", { ascending: false }),
  ])

  return {
    todayStage: todayTile?.plant_stage ?? 0,
    historyTiles: (historyTiles ?? []) as GardenTile[],
  }
}
