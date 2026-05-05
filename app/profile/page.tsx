import Link from "next/link"
import Image from "next/image"
import { getAuthProfile, getSessionStats } from "@/lib/server-data"
import { UsernameForm } from "@/components/profile/UsernameForm"

export default async function ProfilePage() {
  const profile = await getAuthProfile()
  if (!profile) {
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
          <div className="surface-soft relative z-10 w-full max-w-lg rounded-xl p-10 text-center text-sm text-[color:var(--color-text-muted)] shadow-lg shadow-black/40">
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
  const stats = await getSessionStats(profile.id)
  const totalHours = (stats.totalMinutes || 0) / 60

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
        <div className="surface-soft relative z-10 flex min-h-[320px] w-full max-w-lg flex-col justify-between rounded-xl p-8 shadow-lg shadow-black/40 sm:p-10">
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
                    {/* Placeholder for streak value */}
                    --
                  </div>
                  <p className="mt-1 text-[11px] text-[color:var(--color-text-muted)]">
                    Consecutive days you&apos;ve focused.
                  </p>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    Best streak
                  </span>
                  <div className="mt-1 text-base font-medium">--</div>
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
                  <div className="mt-1 text-base font-medium">{stats.completedSessions}</div>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    Focus hours
                  </span>
                  <div className="mt-1 text-base font-medium">{totalHours.toFixed(1)}</div>
                </div>
              </div>
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

