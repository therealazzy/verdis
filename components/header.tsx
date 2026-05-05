import Link from "next/link"
import { signOutAction } from "@/app/actions/auth"
import { ThemeToggle } from "@/components/ThemeToggle"
import { getAuthProfile } from "@/lib/server-data"

export default async function Header() {
  const profile = await getAuthProfile()

  const isAuthed = !!profile

  return (
    <header className="border-b border-white/10 surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-wide sm:text-xl">
          🌱 Verdis
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />

          {isAuthed ? (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
              <Link href="/dashboard" className="link-accent">
                Timer
              </Link>
              <Link
                href="/profile"
                className="max-w-[120px] truncate sm:max-w-none link-accent"
              >
                Profile
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="btn-primary px-3 py-1 text-xs sm:text-sm"
                >
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs sm:text-sm text-white/80">
              <div className="flex gap-2 sm:gap-3">
                <a href="/login" className="link-accent">
                  Login
                </a>
                <a href="/signup" className="link-accent">
                  Sign up
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}