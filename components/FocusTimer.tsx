"use client"

import { useEffect, useMemo, useState } from "react"
import type { GardenTile, Profile } from "@/lib/server-data"
import {
  cancelSessionAction,
  completeFocusSessionAction,
  startFocusSessionAction,
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

type FocusTimerProps = {
  profile: Profile | null
  initialGardenData: {
    todayStage: number
    historyTiles: GardenTile[]
  }
}

export function FocusTimer({ profile, initialGardenData }: FocusTimerProps) {
  const [plannedMinutes, setPlannedMinutes] = useState(25)
  const [plannedInput, setPlannedInput] = useState("25")
  const [sessionInitialSeconds, setSessionInitialSeconds] =
    useState<number | null>(null)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [todayStage, setTodayStage] = useState<number | null>(
    initialGardenData.todayStage ?? 0,
  )
  const [historyTiles, setHistoryTiles] = useState<GardenTile[]>(
    initialGardenData.historyTiles ?? [],
  )

  useEffect(() => {
    if (!isRunning || timerSeconds <= 0) return

    const id = window.setInterval(() => {
      setTimerSeconds((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => window.clearInterval(id)
  }, [isRunning, timerSeconds])

  useEffect(() => {
    if (isRunning && timerSeconds === 0 && currentSessionId) {
      void completeSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerSeconds, isRunning, currentSessionId])

  const startSession = async () => {
    if (!profile || isRunning) return

    const parsedFromInput = Number(plannedInput)
    const baseMinutes = Number.isFinite(parsedFromInput)
      ? parsedFromInput
      : plannedMinutes || 25
    const durationMinutes = Math.max(20, Math.min(180, Math.round(baseMinutes)))

    if (!Number.isFinite(durationMinutes)) return

    setPlannedMinutes(durationMinutes)
    setPlannedInput(String(durationMinutes))
    setUpdating(true)
    setErrorMessage(null)

    const result = await startFocusSessionAction(durationMinutes)
    if (result.error) {
      setErrorMessage(result.error)
      setUpdating(false)
      return
    }

    const startSeconds = result.data.plannedMinutes * 60
    setCurrentSessionId(result.data.sessionId)
    setSessionInitialSeconds(startSeconds)
    setTimerSeconds(startSeconds)
    setIsRunning(true)
    setUpdating(false)
  }

  const completeSession = async () => {
    if (!profile || !currentSessionId) return
    setUpdating(true)
    setIsRunning(false)
    setErrorMessage(null)

    const totalSeconds = sessionInitialSeconds ?? plannedMinutes * 60
    const elapsedSeconds = totalSeconds - timerSeconds
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60))
    const requiredMinutes = (sessionInitialSeconds ?? plannedMinutes * 60) / 60

    const result = await completeFocusSessionAction({
      sessionId: currentSessionId,
      elapsedMinutes,
      requiredMinutes,
    })

    if (result.error) {
      setErrorMessage(result.error)
      setUpdating(false)
      return
    }

    setTodayStage(result.data.todayStage)
    setHistoryTiles(result.data.historyTiles)
    setCurrentSessionId(null)
    setSessionInitialSeconds(null)
    setTimerSeconds(plannedMinutes * 60)
    setUpdating(false)
  }

  const cancelSession = async () => {
    setIsRunning(false)
    setErrorMessage(null)

    if (currentSessionId) {
      const result = await cancelSessionAction(currentSessionId)
      if (result.error) {
        setErrorMessage(result.error)
      }
    }

    setCurrentSessionId(null)
    setSessionInitialSeconds(null)
    setTimerSeconds(plannedMinutes * 60)
  }

  const stageLabel = useMemo(
    () => plantStageLabel(todayStage),
    [todayStage],
  )

  return (
    <div className="relative w-full flex items-center justify-center">
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm pointer-events-none transition-opacity duration-500 ${
          isRunning ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="relative z-10 w-full max-w-lg min-h-[500px] rounded-xl bg-transparent p-10 text-black shadow-lg shadow-black/40 dark:text-white">
      <h2 className="text-xl font-semibold mb-1">Focus mode</h2>
      <p className="text-xs text-[color:var(--color-text-muted)] mb-4">
        Set a focus session. Each completed session grows your plant for today.
      </p>

      {errorMessage && (
        <div className="mb-4 rounded-md bg-red-100 dark:bg-red-900 p-3 text-sm text-red-800 dark:text-red-200">
          {errorMessage}
        </div>
      )}

        <div className="flex flex-col items-center gap-6">
          <div
            className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-[color:var(--color-border-soft)] flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)] ${
              isRunning ? "animate-pulse" : ""
            }`}
          >
            <span className="text-3xl sm:text-4xl font-mono">
              {formatTime(timerSeconds)}
            </span>
          </div>

          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
              <span className="uppercase tracking-wide text-[10px]">
                Length (min)
              </span>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={20}
                max={180}
                value={plannedInput}
                disabled={isRunning || updating}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, "")
                  setPlannedInput(cleaned)
                }}
                onBlur={() => {
                  const parsed = Number(plannedInput)
                  const nextMinutes = Number.isFinite(parsed)
                    ? Math.min(180, Math.max(20, parsed))
                    : 20
                  setPlannedMinutes(nextMinutes)
                  setPlannedInput(String(nextMinutes))
                  if (!isRunning) {
                    setTimerSeconds(nextMinutes * 60)
                  }
                }}
                className="w-20 rounded-md border border-[color:var(--color-border-soft)] bg-transparent px-2 py-1 text-xs text-[color:var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-text-muted)]"
              />
            </label>
            {!isRunning ? (
              <button
                onClick={startSession}
                disabled={updating || !profile}
                className="btn-primary px-6 py-2 disabled:opacity-60"
              >
                Start session
              </button>
            ) : (
              <>
                <button
                  onClick={completeSession}
                  disabled={updating || timerSeconds > 0}
                  className="btn-primary px-6 py-2 disabled:opacity-60"
                >
                  Complete
                </button>
                <button
                  onClick={cancelSession}
                  disabled={updating}
                  className="px-4 py-2 rounded-md border border-[color:var(--color-border-soft)] text-sm text-[color:var(--color-text-muted)] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
          {/* Spacer */}
          <div className="h-1" aria-hidden="true" />
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
              <h2 className="text-sm font-semibold text-[color:var(--color-text-muted)] mb-3">
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
    </div>
  )
}

