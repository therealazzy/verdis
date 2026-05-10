"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types"

export async function updateUsernameAction(
  formData: FormData,
): Promise<ActionResult<{ username: string }>> {
  const usernameValue = formData.get("username")
  const username = typeof usernameValue === "string" ? usernameValue.trim() : ""

  if (!username) {
    return { data: null, error: "Username cannot be empty." }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "You must be logged in." }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", user.id)

  if (error) {
    return { data: null, error: "Failed to update username." }
  }

  revalidatePath("/profile")
  return { data: { username }, error: null }
}
