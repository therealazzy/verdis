"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getGardenData } from "@/lib/server-data"

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

async function getAuthenticatedUserId() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return { supabase, userId: user.id }
}

export async function startFocusSessionAction(durationMinutes: number) {
  const { supabase, userId } = await getAuthenticatedUserId()
  const plannedMinutes = clamp(Math.round(durationMinutes), 20, 180)

  const { data, error } = await supabase
    .from("sessions")
    .insert({ user_id: userId, duration_minutes: plannedMinutes, completed: false })
    .select("id")
    .single()

  if (error || !data) {
    throw new Error("Failed to start session")
  }

  return { sessionId: data.id as string, plannedMinutes }
}

export async function completeFocusSessionAction(params: {
  sessionId: string
  elapsedMinutes: number
  requiredMinutes: number
}) {
  const { supabase, userId } = await getAuthenticatedUserId()
  const elapsedMinutes = Math.max(1, Math.round(params.elapsedMinutes))
  const requiredMinutes = Math.max(20, Math.round(params.requiredMinutes))
  const completed = elapsedMinutes >= requiredMinutes

  await supabase
    .from("sessions")
    .update({
      completed,
      duration_minutes: elapsedMinutes,
    })
    .eq("id", params.sessionId)
    .eq("user_id", userId)

  if (completed) {
    const today = new Date().toISOString().slice(0, 10)
    const { data: currentTile } = await supabase
      .from("garden_tiles")
      .select("id, plant_stage")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle()

    if (currentTile?.id) {
      const nextStage = Math.min((currentTile.plant_stage ?? 0) + 1, 3)
      await supabase
        .from("garden_tiles")
        .update({ plant_stage: nextStage })
        .eq("id", currentTile.id)
        .eq("user_id", userId)
    } else {
      await supabase.from("garden_tiles").insert({
        user_id: userId,
        date: today,
        plant_stage: 1,
        plant_type: "flower",
      })
    }
  }

  return getGardenData(userId)
}

export async function startMarathonSessionAction(params: {
  focusMinutes: number
  blocks: number
}) {
  const { supabase, userId } = await getAuthenticatedUserId()
  const focusMinutes = clamp(Math.round(params.focusMinutes), 20, 180)
  const blocks = clamp(Math.round(params.blocks), 1, 8)
  const totalMinutes = focusMinutes * blocks

  const { data, error } = await supabase
    .from("sessions")
    .insert({ user_id: userId, duration_minutes: totalMinutes, completed: false })
    .select("id")
    .single()

  if (error || !data) {
    throw new Error("Failed to start marathon session")
  }

  return { sessionId: data.id as string, focusMinutes, blocks }
}

export async function completeMarathonSessionAction(params: {
  sessionId: string
  elapsedMinutes: number
}) {
  const { supabase, userId } = await getAuthenticatedUserId()
  const elapsedMinutes = Math.max(1, Math.round(params.elapsedMinutes))

  await supabase
    .from("sessions")
    .update({
      completed: true,
      duration_minutes: elapsedMinutes,
    })
    .eq("id", params.sessionId)
    .eq("user_id", userId)

  const today = new Date().toISOString().slice(0, 10)
  const { data: currentTile } = await supabase
    .from("garden_tiles")
    .select("id, plant_stage")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle()

  if (currentTile?.id) {
    const nextStage = Math.min((currentTile.plant_stage ?? 0) + 1, 3)
    await supabase
      .from("garden_tiles")
      .update({ plant_stage: nextStage })
      .eq("id", currentTile.id)
      .eq("user_id", userId)
  } else {
    await supabase.from("garden_tiles").insert({
      user_id: userId,
      date: today,
      plant_stage: 1,
      plant_type: "flower",
    })
  }

  return getGardenData(userId)
}
