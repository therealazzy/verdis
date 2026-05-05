"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function updateUsernameAction(formData: FormData) {
  const usernameValue = formData.get("username")
  const username = typeof usernameValue === "string" ? usernameValue.trim() : ""

  if (!username) {
    return { error: "Username cannot be empty." }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in." }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", user.id)

  if (error) {
    return { error: "Failed to update username." }
  }

  revalidatePath("/profile")
  return { success: "Username updated." }
}
