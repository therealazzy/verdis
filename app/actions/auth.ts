"use server"

import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

export async function loginAction(formData: FormData) {
  const email = getFormValue(formData, "email")
  const password = getFormValue(formData, "password")

  if (!email || !password) {
    redirect("/login?error=missing_fields")
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect("/login?error=invalid_credentials")
  }

  redirect("/")
}

export async function signupAction(formData: FormData) {
  const email = getFormValue(formData, "email")
  const password = getFormValue(formData, "password")
  const username = getFormValue(formData, "username")

  if (!email || !password || !username) {
    redirect("/signup?error=missing_fields")
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    redirect("/signup?error=signup_failed")
  }

  if (data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", data.user.id)

    if (profileError) {
      redirect("/signup?error=profile_setup_failed")
    }
  }

  redirect("/login?success=account_created")
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    redirect("/login?error=signout_failed")
  }

  redirect("/login")
}
