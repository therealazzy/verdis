"use client"

import { useState } from "react"
import { FocusTimer } from "@/components/FocusTimer"
import { MarathonTimer } from "@/components/MarathonTimer"

type TimerMode = "focus" | "marathon"

export default function Dashboard() {
  const [mode, setMode] = useState<TimerMode>("focus")

  return (
    <div className="flex flex-col items-stretch gap-6 px-4 py-6 sm:px-6 md:flex-row md:items-center md:h-[560px] max-w-5xl mx-auto w-full">
      <div className="flex flex-row md:flex-col gap-2 md:justify-center md:h-full">
        <button
          type="button"
          onClick={() => setMode("focus")}
          className={`px-4 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
            mode === "focus"
              ? "surface-soft text-white"
              : "bg-black/10 text-white/60 hover:bg-black/20"
          }`}
        >
          Focus mode
        </button>
        <button
          type="button"
          onClick={() => setMode("marathon")}
          className={`px-4 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
            mode === "marathon"
              ? "surface-soft text-white"
              : "bg-black/10 text-white/60 hover:bg-black/20"
          }`}
        >
          Marathon mode
        </button>
      </div>

      <div className="flex-1 flex justify-center">
        {mode === "focus" ? <FocusTimer /> : <MarathonTimer />}
      </div>
    </div>
  )
}