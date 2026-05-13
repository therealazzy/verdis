import Link from "next/link"
import Image from "next/image"
import { getAuthProfile, getSessionStats } from "@/lib/server-data"
import { UsernameForm } from "@/components/profile/UsernameForm"

export default async function ProfilePage() {
  const profile = await getAuthProfile()
  if (!profile) {
    return (
      <section className="relative h-[calc(100vh-64px)] overflow-hidden px-6 py-0 md:px-16 lg:px-24 xl:px-32">
        <div className="relative flex h-full items-center justify-center overflow-hidden rounded-[2rem] bg-[rgba(241,245,249,0.88)] px-6 py-12 shadow-[0_24px_80px_rgba(15,23,42,0.22),0_8px_28px_rgba(51,65,85,0.18)] dark:bg-[rgba(30,41,59,0.72)] dark:shadow-[0_24px_80px_rgba(2,6,23,0.65),0_8px_28px_rgba(15,23,42,0.45)] md:px-12 md:py-16">
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
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-transparent p-10 text-center text-sm text-black shadow-[0_20px_55px_rgba(2,6,23,0.45)] dark:text-white">
            You&apos;re not logged in.
            <div className="mt-4 flex justify-center gap-4">
              <Link href="/login" className="link-accent">
                Login
              </Link>
              <Link href="/signup" className="link-accent">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }
  const statsResult = await getSessionStats(profile.id)

  return (
    <section className="relative h-[calc(100vh-64px)] overflow-hidden px-6 py-0 md:px-16 lg:px-24 xl:px-32">
      <div className="relative flex h-full items-center justify-center overflow-hidden rounded-[2rem] bg-[rgba(241,245,249,0.88)] px-6 py-12 shadow-[0_24px_80px_rgba(15,23,42,0.22),0_8px_28px_rgba(51,65,85,0.18)] dark:bg-[rgba(30,41,59,0.72)] dark:shadow-[0_24px_80px_rgba(2,6,23,0.65),0_8px_28px_rgba(15,23,42,0.45)] md:px-12 md:py-16">
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
        <div className="relative z-10 flex min-h-[320px] w-full max-w-lg flex-col justify-between rounded-xl bg-transparent p-8 text-black shadow-[0_20px_55px_rgba(2,6,23,0.45)] dark:text-white sm:p-10">
          <div>
            <h2 className="mb-1 text-xl font-semibold">Profile</h2>
            <p className="mb-6 text-xs text-[color:var(--color-text-muted)]">
              Overview of your focus journey.
            </p>

            <div className="flex flex-col gap-4">
              <UsernameForm initialUsername={profile.username || ""} />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    Current streak
                  </span>
                  <div className="mt-1 text-base font-medium">
                    {profile.current_streak ?? 0}
                  </div>
                  <p className="mt-1 text-[11px] text-[color:var(--color-text-muted)]">
                    Consecutive days you&apos;ve focused.
                  </p>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    Best streak
                  </span>
                  <div className="mt-1 text-base font-medium">{profile.longest_streak ?? 0}</div>
                  <p className="mt-1 text-[11px] text-[color:var(--color-text-muted)]">
                    Longest run you&apos;ve ever done.
                  </p>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    Completed sessions
                  </span>
                  <div className="mt-1 text-base font-medium">
                    {statsResult.ok ? statsResult.stats.completedSessions : "—"}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    Focus hours
                  </span>
                  <div className="mt-1 text-base font-medium">
                    {statsResult.ok
                      ? ((statsResult.stats.totalMinutes || 0) / 60).toFixed(1)
                      : "—"}
                  </div>
                </div>
              </div>
              {!statsResult.ok ? (
                <p className="mt-2 text-[11px] text-[color:var(--color-text-muted)]">
                  Session statistics could not be loaded ({statsResult.error.message}).
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 text-[11px] text-[color:var(--color-text-muted)]">
            Session stats include both focus and marathon timers when fully
            completed.
          </div>
        </div>
      </div>
    </section>
  )
}

