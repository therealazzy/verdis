import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { signupAction } from "@/app/actions/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect("/")

  const params = await searchParams
  const errorMessage =
    params.error === "missing_fields"
      ? "Please complete all fields."
      : params.error === "signup_failed"
        ? "Sign up failed. Please try again."
        : ""

  return (
    <section className="px-6 py-6 md:px-16 lg:px-24 xl:px-32">
      <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden rounded-[2rem] px-6 py-10 md:px-12">
        <Image
          src="/landing/hero-gradient-light.svg"
          alt=""
          fill
          className="object-cover dark:hidden"
          priority
        />
        <Image
          src="/landing/hero-gradient-dark.svg"
          alt=""
          fill
          className="hidden object-cover dark:block"
          priority
        />
        <form
          className="relative z-10 w-full max-w-md rounded-[1.5rem] p-8 shadow-lg sm:p-10"
          action={signupAction}
          style={{
            border: "1px solid var(--color-border-soft)",
            backgroundColor: "transparent",
            color: "var(--color-text)",
          }}
        >
          <h2 className="text-3xl font-semibold">Sign up</h2>
          <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
            Start building your focus rhythm with Verdis.
          </p>
          {errorMessage ? (
            <p className="mt-4 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {errorMessage}
            </p>
          ) : null}

          <input
            name="username"
            type="text"
            placeholder="Username"
            className="mt-6 w-full rounded-md border border-[color:var(--color-border-soft)] bg-transparent px-3 py-2 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-text-muted)]"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="mt-3 w-full rounded-md border border-[color:var(--color-border-soft)] bg-transparent px-3 py-2 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-text-muted)]"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="mt-3 w-full rounded-md border border-[color:var(--color-border-soft)] bg-transparent px-3 py-2 text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-text-muted)]"
            required
          />

          <button
            type="submit"
            className="mt-5 w-full rounded-md px-4 py-2 font-medium transition-opacity hover:opacity-95"
            style={{ backgroundColor: "var(--color-accent)", color: "#1a1a1a" }}
          >
            Sign up
          </button>
          <p className="mt-4 text-sm text-[color:var(--color-text-muted)]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[color:var(--color-accent)]">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </section>
  )
}