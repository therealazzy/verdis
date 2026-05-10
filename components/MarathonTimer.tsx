"use client"

import { useEffect, useMemo, useState } from "react"
import type { GardenTile, Profile } from "@/lib/server-data"
import {
  cancelSessionAction,
  completeMarathonSessionAction,
  startMarathonSessionAction,
} from "@/app/actions/sessions"

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

type MarathonTimerProps = {
  profile: Profile | null
  initialGardenData: {
    todayStage: number
    historyTiles: GardenTile[]
  }
}

export function MarathonTimer({ profile, initialGardenData }: MarathonTimerProps) {

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [todayStage, setTodayStage] = useState<number | null>(initialGardenData.todayStage ?? 0)
  const [historyTiles, setHistoryTiles] = useState<GardenTile[]>(initialGardenData.historyTiles ?? [])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase, isRunning, breakMinutes, focusMinutes, currentBlock, blocks])

  const totalPlannedFocusMinutes = useMemo(
    () => Math.max(20, Math.round(focusMinutes)) * Math.max(1, Math.round(blocks)),
    [focusMinutes, blocks],
  )

  const start = async () => {
    if (!profile || isRunning) return
    setUpdating(true)
    setErrorMessage(null)

    // Resolve any pending input edits before starting
    const parsedFocus = Number(focusInput)
    const resolvedFocus = Number.isFinite(parsedFocus)
      ? Math.min(180, Math.max(20, parsedFocus))
      : focusMinutes
    const nextFocus = resolvedFocus || 50
    setFocusMinutes(nextFocus)
    setFocusInput(String(nextFocus))

    const result = await startMarathonSessionAction({
      focusMinutes: nextFocus,
      blocks,
    })
    
    if (result.error) {
      setErrorMessage(result.error)
      setUpdating(false)
      return
    }

    setCurrentSessionId(result.data.sessionId)
    setPhase("focus")
    setCurrentBlock(1)
    setSecondsLeft(Math.max(20, Math.round(nextFocus)) * 60)
    setIsRunning(true)
    setUpdating(false)
  }

  const reset = async () => {
    setIsRunning(false)
    setErrorMessage(null)

    if (currentSessionId) {
      const result = await cancelSessionAction(currentSessionId)
      if (result.error) {
        setErrorMessage(result.error)
      }
    }

    setCurrentSessionId(null)
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
    if (!currentSessionId) return
    setErrorMessage(null)

    const elapsedMinutes = totalPlannedFocusMinutes

    const result = await completeMarathonSessionAction({
      sessionId: currentSessionId,
      elapsedMinutes,
    })

    if (result.error) {
      setErrorMessage(result.error)
      return
    }

    setTodayStage(result.data.todayStage)
    setHistoryTiles(result.data.historyTiles)
    setCurrentSessionId(null)
  }

  return (
    <div className="relative w-full flex items-center justify-center">
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm pointer-events-none transition-opacity duration-500 ${
          isRunning ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="relative z-10 w-full max-w-lg min-h-[500px] rounded-xl bg-transparent p-10 text-black shadow-lg shadow-black/40 dark:text-white">
      <h2 className="text-xl font-semibold mb-1">Marathon mode</h2>
      <span className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
          {isFocus ? "Focus" : "Break"} • Block {currentBlock} of {blocks}
        </span>

      {errorMessage && (
        <div className="my-3 rounded-md bg-red-100 dark:bg-red-900 p-3 text-sm text-red-800 dark:text-red-200">
          {errorMessage}
        </div>
      )}
      <div className="flex flex-col items-center gap-4 mb-4">
        <div
          className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-[color:var(--color-border-soft)] flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)] ${
            isRunning ? "animate-pulse" : ""
          }`}
        >
          <span className="text-3xl sm:text-4xl font-mono">
            {formatTime(secondsLeft)}
          </span>
        </div>

      </div>

      <div className="grid grid-cols-3 gap-3 text-xs text-[color:var(--color-text-muted)] mb-4">
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
            className="w-full rounded-md border border-[color:var(--color-border-soft)] bg-transparent px-2 py-1 text-xs text-[color:var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-text-muted)]"
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
            className="w-full rounded-md border border-[color:var(--color-border-soft)] bg-transparent px-2 py-1 text-xs text-[color:var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-text-muted)]"
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
            className="w-full rounded-md border border-[color:var(--color-border-soft)] bg-transparent px-2 py-1 text-xs text-[color:var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-text-muted)]"
          />
        </label>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={start}
          disabled={updating || isRunning || !profile}
          className="btn-primary px-6 py-2 disabled:opacity-60"
        >
          Start marathon
        </button>
        <button
          onClick={reset}
          disabled={updating}
          className="px-4 py-2 rounded-md border border-[color:var(--color-border-soft)] text-sm text-[color:var(--color-text)] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-lg surface flex items-center justify-center text-2xl">
          {plantStageEmoji(todayStage)}
        </div>
        <span className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
          Today&apos;s growth: {stageLabel}
        </span>
      </div>
      {historyTiles.length > 0 && (
        <div className="mt-8 w-full">
          <h2 className="mb-3 text-sm font-semibold text-[color:var(--color-text-muted)]">
            Previous days
          </h2>
          <div className="grid grid-cols-5 gap-3 sm:grid-cols-7">
            {historyTiles.map((tile) => {
              const date = new Date(tile.date)
              const label = date.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })
              return (
                <div
                  key={tile.date}
                  className="flex flex-col items-center gap-1 text-xs text-[color:var(--color-text-muted)]"
                >
                  <div className="w-10 h-10 rounded-lg surface flex items-center justify-center text-lg">
                    {plantStageEmoji(tile.plant_stage)}
                  </div>
                  <span className="leading-tight">{label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

