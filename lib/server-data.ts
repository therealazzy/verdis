import { cache } from "react"
import type { PostgrestError } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type Profile = {
  id: string
  username: string | null
  current_streak: number | null
  longest_streak: number | null
}

export type GardenTile = {
  date: string
  plant_stage: number
  plant_type: string
}

export type GardenData = {
  todayStage: number
  historyTiles: GardenTile[]
}

export type SessionStats = {
  completedSessions: number
  totalMinutes: number
}

export type GetSessionStatsResult =
  | { ok: true; stats: SessionStats }
  | { ok: false; error: PostgrestError }

export type GetGardenDataResult =
  | { ok: true; data: GardenData }
  | { ok: false; error: PostgrestError }

function toUtcDateOnly(dateString: string) {
  return new Date(`${dateString}T00:00:00.000Z`)
}

function diffDaysUtc(later: Date, earlier: Date) {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor((later.getTime() - earlier.getTime()) / msPerDay)
}

function computeCurrentStreakFromDates(dates: string[]) {
  if (dates.length === 0) return 0

  const sorted = [...dates].sort((a, b) => b.localeCompare(a))
  const uniqueSorted = sorted.filter((date, index) => date !== sorted[index - 1])

  const today = new Date()
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const latestDate = toUtcDateOnly(uniqueSorted[0])
  const latestGap = diffDaysUtc(todayUtc, latestDate)

  // If the most recent activity is older than yesterday, streak is broken.
  if (latestGap > 1) return 0

  let streak = 1
  for (let i = 1; i < uniqueSorted.length; i += 1) {
    const prev = toUtcDateOnly(uniqueSorted[i - 1])
    const current = toUtcDateOnly(uniqueSorted[i])
    if (diffDaysUtc(prev, current) !== 1) break
    streak += 1
  }

  return streak
}

export const getAuthProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return null

  // TODO: add Database generic to createSupabaseServerClient once generated types exist
  const profileQuery = supabase
    .from("profiles")
    .select("id, username, current_streak, longest_streak")
    .eq("id", user.id)
    .maybeSingle()

  // TODO: add Database generic to createSupabaseServerClient once generated types exist
  const streakDatesQuery = supabase
    .from("garden_tiles")
    .select("date")
    .eq("user_id", user.id)
    .gt("plant_stage", 0)
    .order("date", { ascending: false })
    .limit(90)

  const [{ data: profile, error: profileError }, { data: streakRows, error: streakDatesError }] =
    await Promise.all([profileQuery, streakDatesQuery])

  if (profileError) return null
  if (streakDatesError) return null

  const streakDates: string[] = (streakRows ?? []).map((row: { date: string }) => row.date)
  const computedCurrentStreak = computeCurrentStreakFromDates(streakDates)

  if (!profile) {
    return {
      id: user.id,
      username: null,
      current_streak: computedCurrentStreak,
      longest_streak: 0,
    }
  }

  return {
    id: profile.id,
    username: profile.username,
    current_streak: computedCurrentStreak,
    longest_streak: profile.longest_streak,
  }
})

export async function getSessionStats(userId: string): Promise<GetSessionStatsResult> {
  const supabase = await createSupabaseServerClient()
  // TODO: add Database generic to createSupabaseServerClient once generated types exist
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("duration_minutes, completed")
    .eq("user_id", userId)

  if (error) {
    return { ok: false, error }
  }

  const completed = sessions.filter((session) => session.completed)
  const totalMinutes = completed.reduce(
    (sum, session) => sum + (session.duration_minutes ?? 0),
    0,
  )

  return {
    ok: true,
    stats: {
      completedSessions: completed.length,
      totalMinutes,
    },
  }
}

export async function getGardenData(userId: string): Promise<GetGardenDataResult> {
  const supabase = await createSupabaseServerClient()
  const today = new Date().toISOString().slice(0, 10)

  // TODO: add Database generic to createSupabaseServerClient once generated types exist
  const todayTileQuery = supabase
    .from("garden_tiles")
    .select("plant_stage")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle()

  // TODO: add Database generic to createSupabaseServerClient once generated types exist
  const historyTilesQuery = supabase
    .from("garden_tiles")
    .select("date, plant_stage, plant_type")
    .eq("user_id", userId)
    .lt("date", today)
    .order("date", { ascending: false })

  const [{ data: todayTile, error: todayError }, { data: historyTiles, error: historyError }] =
    await Promise.all([todayTileQuery, historyTilesQuery])

  if (todayError) {
    return { ok: false, error: todayError }
  }
  if (historyError) {
    return { ok: false, error: historyError }
  }

  const tiles: GardenTile[] = (historyTiles ?? []).map(
    (row: { date: string; plant_stage: number; plant_type: string }) => ({
      date: row.date,
      plant_stage: row.plant_stage,
      plant_type: row.plant_type,
    }),
  )

  return {
    ok: true,
    data: {
      todayStage: todayTile?.plant_stage ?? 0,
      historyTiles: tiles,
    },
  }
}
