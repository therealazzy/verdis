"use client"

import { useState } from "react"
import { FocusTimer } from "@/components/FocusTimer"
import { MarathonTimer } from "@/components/MarathonTimer"

type TimerMode = "focus" | "marathon"

export default function Dashboard() {
  const [mode, setMode] = useState<TimerMode>("focus")

  return (
    <div className="flex w-full max-w-5xl mx-auto gap-6 items-center h-[560px]">
      <div className="flex flex-col gap-2 justify-center h-full">
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