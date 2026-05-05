import { getAuthProfile } from "@/lib/server-data"
import { HeroSection } from "@/components/landing/HeroSection"
import { Footer } from "@/components/landing/Footer"

export default async function LandingPage() {
  const profile = await getAuthProfile()

  return (
    <div
      className="min-h-full"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <HeroSection isAuthed={Boolean(profile)} />
      <Footer />
    </div>
  )
}