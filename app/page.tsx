import { getAuthProfile } from "@/lib/server-data"
import { HeroSection } from "@/components/landing/HeroSection"
import { Footer } from "@/components/landing/Footer"

const features = [
  {
    title: "Guided Focus Sessions",
    description: "Start structured sessions fast and keep your daily focus rhythm consistent.",
  },
  {
    title: "Progress Tracking",
    description: "See your streaks and session history so your momentum stays visible.",
  },
  {
    title: "Habit Momentum",
    description: "Turn small, repeatable wins into long-term focus habits that stick.",
  },
]

export default async function LandingPage() {
  const profile = await getAuthProfile()

  return (
    <div
      className="min-h-full"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <HeroSection isAuthed={Boolean(profile)} />
      <section id="features" className="min-h-screen scroll-mt-20 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-black dark:text-white sm:text-4xl">Features</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-black/15 bg-[rgba(241,245,249,0.88)] bg-[url('/landing/hero-gradient-light.svg')] bg-cover bg-center p-6 shadow-sm dark:border-white/15 dark:bg-[rgba(30,41,59,0.72)] dark:bg-[url('/landing/hero-gradient-dark.svg')]"
              >
                <h3 className="text-xl font-semibold text-black dark:text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-black/80 dark:text-slate-300">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}