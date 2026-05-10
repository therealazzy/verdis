"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getGardenData } from "@/lib/server-data"
import type { ActionResult } from "@/lib/types"

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

async function getAuthenticatedUserId() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return { supabase, userId: user.id }
}

export async function startFocusSessionAction(
  durationMinutes: number,
): Promise<ActionResult<{ sessionId: string; plannedMinutes: number }>> {
  const auth = await getAuthenticatedUserId()
  if (!auth) {
    return { data: null, error: "Unauthorized" }
  }

  const { supabase, userId } = auth
  const plannedMinutes = clamp(Math.round(durationMinutes), 20, 180)

  const { data, error } = await supabase
    .from("sessions")
    .insert({ user_id: userId, duration_minutes: plannedMinutes, completed: false })
    .select("id")
    .single()

  if (error || !data) {
    return { data: null, error: "Failed to start session" }
  }

  return { data: { sessionId: data.id as string, plannedMinutes }, error: null }
}

export async function completeFocusSessionAction(params: {
  sessionId: string
  elapsedMinutes: number
  requiredMinutes: number
}): Promise<ActionResult<{ todayStage: number; historyTiles: Array<{ date: string; plant_stage: number; plant_type: string }> }>> {
  const auth = await getAuthenticatedUserId()
  if (!auth) {
    return { data: null, error: "Unauthorized" }
  }

  const { supabase, userId } = auth

  // Fetch session data from server
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, start_time, duration_minutes")
    .eq("id", params.sessionId)
    .eq("user_id", userId)
    .single()

  if (sessionError || !session) {
    return { data: null, error: "Session not found" }
  }

  // Compute expected completion time server-side
  const startedAt = new Date(session.start_time)
  const expectedCompletionTime = new Date(startedAt.getTime() + session.duration_minutes * 60 * 1000)
  const now = new Date()
  const bufferMs = 30 * 1000 // 30 second buffer

  // Validate timing
  if (now.getTime() < expectedCompletionTime.getTime() - bufferMs) {
    return { data: null, error: "Session completed too early" }
  }

  // Call atomic RPC function to mark session complete and update garden tile
  const { error: rpcError } = await supabase.rpc("complete_focus_session", {
    p_session_id: params.sessionId,
    p_user_id: userId,
  })

  if (rpcError) {
    return { data: null, error: `Failed to complete session: ${rpcError.message}` }
  }

  const gardenData = await getGardenData(userId)
  return { data: gardenData, error: null }
}

export async function startMarathonSessionAction(params: {
  focusMinutes: number
  blocks: number
}): Promise<ActionResult<{ sessionId: string; focusMinutes: number; blocks: number }>> {
  const auth = await getAuthenticatedUserId()
  if (!auth) {
    return { data: null, error: "Unauthorized" }
  }

  const { supabase, userId } = auth
  const focusMinutes = clamp(Math.round(params.focusMinutes), 20, 180)
  const blocks = clamp(Math.round(params.blocks), 1, 8)
  const totalMinutes = focusMinutes * blocks

  const { data, error } = await supabase
    .from("sessions")
    .insert({ user_id: userId, duration_minutes: totalMinutes, completed: false })
    .select("id")
    .single()

  if (error || !data) {
    return { data: null, error: "Failed to start marathon session" }
  }

  return { data: { sessionId: data.id as string, focusMinutes, blocks }, error: null }
}

export async function completeMarathonSessionAction(params: {
  sessionId: string
  elapsedMinutes: number
}): Promise<ActionResult<{ todayStage: number; historyTiles: Array<{ date: string; plant_stage: number; plant_type: string }> }>> {
  const auth = await getAuthenticatedUserId()
  if (!auth) {
    return { data: null, error: "Unauthorized" }
  }

  const { supabase, userId } = auth

  // Fetch session data from server
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, start_time, duration_minutes")
    .eq("id", params.sessionId)
    .eq("user_id", userId)
    .single()

  if (sessionError || !session) {
    return { data: null, error: "Session not found" }
  }

  // Compute expected completion time server-side
  const startedAt = new Date(session.start_time)
  const expectedCompletionTime = new Date(startedAt.getTime() + session.duration_minutes * 60 * 1000)
  const now = new Date()
  const bufferMs = 30 * 1000 // 30 second buffer

  // Validate timing
  if (now.getTime() < expectedCompletionTime.getTime() - bufferMs) {
    return { data: null, error: "Session completed too early" }
  }

  // Call atomic RPC function to mark session complete and update garden tile
  const { error: rpcError } = await supabase.rpc("complete_marathon_session", {
    p_session_id: params.sessionId,
    p_user_id: userId,
  })

  if (rpcError) {
    return { data: null, error: `Failed to complete session: ${rpcError.message}` }
  }

  const gardenData = await getGardenData(userId)
  return { data: gardenData, error: null }
}

export async function cancelSessionAction(
  sessionId: string,
): Promise<ActionResult<{ cancelled: boolean }>> {
  const auth = await getAuthenticatedUserId()
  if (!auth) {
    return { data: null, error: "Unauthorized" }
  }

  const { supabase, userId } = auth

  // Delete the session row only if it's incomplete
  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId)
    .eq("completed", false)

  if (error) {
    return { data: null, error: "Failed to cancel session" }
  }

  return { data: { cancelled: true }, error: null }
}
