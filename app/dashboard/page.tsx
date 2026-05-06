import { getAuthProfile, getGardenData } from "@/lib/server-data"
import { DashboardClient } from "@/components/DashboardClient"
import { redirect } from "next/navigation"
import Image from "next/image"

export default async function DashboardPage() {
  const profile = await getAuthProfile()

  if (!profile) {
    redirect("/login")
  }

  const gardenData = await getGardenData(profile.id)

  return (
    <section className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <div className="absolute inset-0">
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
      </div>

      <div className="relative z-10">
        <DashboardClient profile={profile} gardenData={gardenData} />
      </div>
    </section>
  )
}
