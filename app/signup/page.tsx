"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) router.replace("/")
    }
    checkAuth()
  }, [])

  const signUp = async () => {
    setLoading(true)

    // 1️⃣ Sign up auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })

    if (authError) {
      alert(authError.message)
      setLoading(false)
      return
    }

    const user = authData.user
    if (!user) {
      setLoading(false)
      return
    }

    // 2️⃣ Update profile with username (trigger already created row)
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id)

    if (profileError) {
      console.log(profileError)
      alert("Failed to set username")
      setLoading(false)
      return
    }

    setLoading(false)
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-4 w-80">
        <h2 className="text-2xl font-semibold">Sign Up</h2>

        <input
          type="text"
          placeholder="Username"
          className="border p-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="bg-black text-white p-2 disabled:opacity-50"
          disabled={loading}
          onClick={signUp}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </div>
    </div>
  )
}