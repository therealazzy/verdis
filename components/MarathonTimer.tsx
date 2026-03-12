"use client"

import { useEffect, useMemo, useState } from "react"
import { useProfile } from "@/context/ProfileContext"
import { supabase } from "@/lib/supabaseClient"

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`
}

function plantStageLabel(stage: number | null) {
  switch (stage) {
    case 0:
      return "Seed"
    case 1:
      return "Sprout"
    case 2:
      return "Small plant"
    case 3:
      return "Bloom"
    default:
      return "Seed"
  }
}

function plantStageEmoji(stage: number | null) {
  if (!stage || stage <= 0) return "🌱"
  if (stage === 1) return "🌱"
  if (stage === 2) return "🌿"
  return "🌸"
}

type Phase = "focus" | "break"

export function MarathonTimer() {
  const { profile, loading } = useProfile()

  const [focusMinutes, setFocusMinutes] = useState(50)
  const [focusInput, setFocusInput] = useState("50")
  const [breakMinutes, setBreakMinutes] = useState(10)
  const [breakInput, setBreakInput] = useState("10")
  const [blocks, setBlocks] = useState(4)

  const [phase, setPhase] = useState<Phase>("focus")
  const [currentBlock, setCurrentBlock] = useState(1)
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [todayStage, setTodayStage] = useState<number | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // Load today's garden tile stage
  useEffect(() => {
    const loadToday = async () => {
      if (!profile) return
      const today = new Date().toISOString().slice(0, 10)
      const { data, error } = await supabase
        .from("garden_tiles")
        .select("id, plant_stage")
        .eq("user_id", profile.id)
        .eq("date", today)

      if (!error && data && data.length > 0) {
        setTodayStage(data[0].plant_stage)
      } else {
        setTodayStage(0)
      }
    }

    if (!loading) {
      loadToday()
    }
  }, [profile, loading])

  useEffect(() => {
    if (isRunning && phase === "focus") {
      setSecondsLeft(focusMinutes * 60)
    }
  }, [focusMinutes, isRunning, phase])

  useEffect(() => {
    if (isRunning && phase === "break") {
      setSecondsLeft(breakMinutes * 60)
    }
  }, [breakMinutes, isRunning, phase])

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return

    const id = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => window.clearInterval(id)
  }, [isRunning, secondsLeft])

  useEffect(() => {
    if (!isRunning || secondsLeft > 0) return

    if (phase === "focus") {
      setPhase("break")
      setSecondsLeft(breakMinutes * 60)
    } else {
      if (currentBlock >= blocks) {
        void completeMarathonSession()
        setIsRunning(false)
        setCurrentBlock(1)
        setPhase("focus")
        setSecondsLeft(Math.max(20, Math.round(focusMinutes)) * 60)
      } else {
        setCurrentBlock((prev) => prev + 1)
        setPhase("focus")
        setSecondsLeft(Math.max(20, Math.round(focusMinutes)) * 60)
      }
    }
  }, [secondsLeft, phase, isRunning, breakMinutes, focusMinutes, currentBlock, blocks])

  const totalPlannedFocusMinutes = useMemo(
    () => Math.max(20, Math.round(focusMinutes)) * Math.max(1, Math.round(blocks)),
    [focusMinutes, blocks],
  )

  const start = async () => {
    if (!profile || loading || isRunning) return
    setUpdating(true)

    // Resolve any pending input edits before starting
    const parsedFocus = Number(focusInput)
    const resolvedFocus = Number.isFinite(parsedFocus)
      ? Math.min(180, Math.max(20, parsedFocus))
      : focusMinutes
    const nextFocus = resolvedFocus || 50
    setFocusMinutes(nextFocus)
    setFocusInput(String(nextFocus))

    const totalMinutes =
      Math.max(20, Math.round(nextFocus)) * Math.max(1, Math.round(blocks))

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        user_id: profile.id,
        duration_minutes: totalMinutes,
        completed: false,
      })
      .select("id")
      .single()

    if (error || !data) {
      console.error("Failed to start marathon session", error)
      setUpdating(false)
      return
    }

    setCurrentSessionId(data.id as string)
    setPhase("focus")
    setCurrentBlock(1)
    setSecondsLeft(Math.max(20, Math.round(nextFocus)) * 60)
    setIsRunning(true)
    setUpdating(false)
  }

  const reset = () => {
    setIsRunning(false)
    setPhase("focus")
    setCurrentBlock(1)
    setSecondsLeft(Math.max(20, Math.round(focusMinutes)) * 60)
  }

  const isFocus = phase === "focus"

  const stageLabel = useMemo(
    () => plantStageLabel(todayStage),
    [todayStage],
  )

  const completeMarathonSession = async () => {
    if (!profile || !currentSessionId) return

    const elapsedMinutes = totalPlannedFocusMinutes

    await supabase
      .from("sessions")
      .update({
        completed: true,
        duration_minutes: elapsedMinutes,
      })
      .eq("id", currentSessionId)

    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from("garden_tiles")
      .select("id, plant_stage")
      .eq("user_id", profile.id)
      .eq("date", today)

    let nextStage = 1
    if (!error && data && data.length > 0) {
      const currentStage = data[0].plant_stage ?? 0
      nextStage = Math.min(currentStage + 1, 3)
      await supabase
        .from("garden_tiles")
        .update({ plant_stage: nextStage })
        .eq("id", data[0].id)
    } else {
      await supabase.from("garden_tiles").insert({
        user_id: profile.id,
        date: today,
        plant_stage: 1,
        plant_type: "flower",
      })
      nextStage = 1
    }

    setTodayStage(nextStage)
    setCurrentSessionId(null)
  }

  return (
    <div className="relative w-full flex items-center justify-center">
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm pointer-events-none transition-opacity duration-500 ${
          isRunning ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="surface-soft rounded-xl p-10 shadow-lg shadow-black/40 w-full max-w-lg relative z-10 min-h-[500px]">
      <h2 className="text-xl font-semibold mb-1">Marathon mode</h2>
      <span className="text-xs uppercase tracking-wide text-white/60">
          {isFocus ? "Focus" : "Break"} • Block {currentBlock} of {blocks}
        </span>
      <div className="flex flex-col items-center gap-4 mb-4">
        <div
          className={`w-48 h-48 rounded-full border-4 border-white/20 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)] ${
            isRunning ? "animate-pulse" : ""
          }`}
        >
          <span className="text-3xl font-mono">
            {formatTime(secondsLeft)}
          </span>
        </div>

      </div>

      <div className="grid grid-cols-3 gap-3 text-xs text-white/70 mb-4">
        <label className="flex flex-col gap-1">
          <span className="uppercase tracking-wide text-[10px]">
            Focus (min)
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={20}
            max={180}
            value={focusInput}
            disabled={isRunning}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^0-9]/g, "")
              setFocusInput(cleaned)
            }}
            onBlur={() => {
              const parsed = Number(focusInput)
              const next = Number.isFinite(parsed)
                ? Math.min(180, Math.max(20, parsed))
                : 50
              setFocusMinutes(next)
              setFocusInput(String(next))
              if (!isRunning && isFocus) {
                setSecondsLeft(next * 60)
              }
            }}
            className="w-full rounded-md border border-white/20 bg-transparent px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/60"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="uppercase tracking-wide text-[10px]">
            Break (min)
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={5}
            max={60}
            value={breakInput}
            disabled={isRunning}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^0-9]/g, "")
              setBreakInput(cleaned)
            }}
            onBlur={() => {
              const parsed = Number(breakInput)
              const next = Number.isFinite(parsed)
                ? Math.min(60, Math.max(5, parsed))
                : 10
              setBreakMinutes(next)
              setBreakInput(String(next))
              if (!isRunning && !isFocus) {
                setSecondsLeft(next * 60)
              }
            }}
            className="w-full rounded-md border border-white/20 bg-transparent px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/60"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="uppercase tracking-wide text-[10px]">
            Blocks
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={8}
            value={blocks}
            disabled={isRunning}
            onChange={(e) => {
              const v = Number(e.target.value.replace(/[^0-9]/g, ""))
              if (Number.isNaN(v)) return
              const clamped = Math.min(8, Math.max(1, v))
              setBlocks(clamped)
              if (currentBlock > clamped) {
                setCurrentBlock(clamped)
              }
            }}
            className="w-full rounded-md border border-white/20 bg-transparent px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/60"
          />
        </label>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={start}
          disabled={updating || isRunning || !profile || loading}
          className="btn-primary px-6 py-2 disabled:opacity-60"
        >
          Start marathon
        </button>
        <button
          onClick={reset}
          disabled={updating}
          className="px-4 py-2 rounded-md border border-white/20 text-sm text-white/80 hover:bg-white/5 disabled:opacity-60"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-lg surface flex items-center justify-center text-2xl">
          {isFocus ? "🌱" : "🌿"}
        </div>
        <span className="text-xs uppercase tracking-wide text-white/60">
          Today&apos;s growth: {stageLabel}
        </span>
      </div>
      </div>
    </div>
  )
}

