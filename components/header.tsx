import Link from "next/link"
import { signOutAction } from "@/app/actions/auth"
import { ThemeToggle } from "@/components/ThemeToggle"
import { getAuthProfile } from "@/lib/server-data"

export default async function Header() {
  const profile = await getAuthProfile()

  const isAuthed = !!profile
  const navButtonClass =
    "rounded-md px-3 py-1 text-xs text-black transition-colors hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10 sm:text-sm"

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/20 bg-[var(--color-bg)]/90 backdrop-blur-sm dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-wide text-black dark:text-white sm:text-xl">
          🌱 Verdis
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          {isAuthed ? (
            <div className="flex items-center gap-2 text-xs text-black dark:text-slate-300 sm:text-sm">
              <Link href="/dashboard" className={navButtonClass}>
                Timer
              </Link>
              <Link href="/profile" className={`${navButtonClass} max-w-[120px] truncate sm:max-w-none`}>
                Profile
              </Link>
              <form action={signOutAction}>
                <button type="submit" className={navButtonClass}>
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs text-black dark:text-slate-300 sm:text-sm">
              <div className="flex gap-2 sm:gap-3">
                <Link href="/login" className={navButtonClass}>
                  Login
                </Link>
                <Link href="/signup" className={navButtonClass}>
                  Sign up
                </Link>
              </div>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}