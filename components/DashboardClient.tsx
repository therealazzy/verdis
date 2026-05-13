"use client"

import { useState } from "react"
import type { GardenData, Profile } from "@/lib/server-data"
import { FocusTimer } from "@/components/FocusTimer"
import { MarathonTimer } from "@/components/MarathonTimer"

type TimerMode = "focus" | "marathon"

type DashboardClientProps = {
  profile: Profile | null
  gardenData: GardenData
}

export function DashboardClient({ profile, gardenData }: DashboardClientProps) {
  const [mode, setMode] = useState<TimerMode>("focus")

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-stretch gap-6 px-4 py-6 sm:px-6 md:flex-row md:items-start">
      <div className="flex flex-row gap-2 md:h-full md:flex-col md:justify-center">
        <button
          type="button"
          onClick={() => setMode("focus")}
          className={`rounded-lg px-4 py-2 text-left text-xs font-medium transition-colors ${
            mode === "focus"
              ? "surface-soft text-[color:var(--color-text)]"
              : "bg-black/10 text-[color:var(--color-text-muted)] hover:bg-black/20"
          }`}
        >
          Focus mode
        </button>
        <button
          type="button"
          onClick={() => setMode("marathon")}
          className={`rounded-lg px-4 py-2 text-left text-xs font-medium transition-colors ${
            mode === "marathon"
              ? "surface-soft text-[color:var(--color-text)]"
              : "bg-black/10 text-[color:var(--color-text-muted)] hover:bg-black/20"
          }`}
        >
          Marathon mode
        </button>
      </div>

      <div className="flex flex-1 justify-center">
        {mode === "focus" ? (
          <FocusTimer profile={profile} initialGardenData={gardenData} />
        ) : (
          <MarathonTimer profile={profile} initialGardenData={gardenData} />
        )}
      </div>
    </div>
  )
}
