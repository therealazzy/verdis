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
 
export default function Dashboard() {
  const { profile, loading } = useProfile()
  const [plannedMinutes, setPlannedMinutes] = useState(25)
  const [plannedInput, setPlannedInput] = useState("25")
  const [sessionInitialSeconds, setSessionInitialSeconds] = useState<number | null>(null)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [todayStage, setTodayStage] = useState<number | null>(null)
  const [historyTiles, setHistoryTiles] = useState<
    { date: string; plant_stage: number; plant_type: string }[]
  >([])
 
   // Load today's garden tile when profile is ready
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

      const { data: history, error: historyError } = await supabase
        .from("garden_tiles")
        .select("date, plant_stage, plant_type")
        .eq("user_id", profile.id)
        .lt("date", today)
        .order("date", { ascending: false })

      if (!historyError && history) {
        setHistoryTiles(history)
      } else {
        setHistoryTiles([])
      }
     }
 
     if (!loading) {
       loadToday()
     }
   }, [profile, loading])
 
   // Timer ticking
   useEffect(() => {
     if (!isRunning || timerSeconds <= 0) return
 
     const id = window.setInterval(() => {
       setTimerSeconds((prev) => Math.max(prev - 1, 0))
     }, 1000)
 
     return () => window.clearInterval(id)
   }, [isRunning, timerSeconds])
 
   // When timer hits zero, complete the session
   useEffect(() => {
     if (isRunning && timerSeconds === 0 && currentSessionId) {
       void completeSession()
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [timerSeconds, isRunning, currentSessionId])
 
  const startSession = async () => {
    if (!profile || isRunning) return

    // Derive planned minutes from input so DB and UI always match
    const parsedFromInput = Number(plannedInput)
    const baseMinutes = Number.isFinite(parsedFromInput)
      ? parsedFromInput
      : plannedMinutes || 25
    const durationMinutes = Math.max(20, Math.min(180, Math.round(baseMinutes)))

    if (!Number.isFinite(durationMinutes)) return

    setPlannedMinutes(durationMinutes)
    setPlannedInput(String(durationMinutes))
    setUpdating(true)

    const { data, error } = await supabase
       .from("sessions")
       .insert({
         user_id: profile.id,
         duration_minutes: durationMinutes,
         completed: false,
       })
       .select("id")
       .single()
 
     if (error || !data) {
       console.error("Failed to start session", error)
       setUpdating(false)
       return
     }
 
    const startSeconds = durationMinutes * 60
    setCurrentSessionId(data.id as string)
    setSessionInitialSeconds(startSeconds)
    setTimerSeconds(startSeconds)
     setIsRunning(true)
     setUpdating(false)
   }
 
   const completeSession = async () => {
     if (!profile || !currentSessionId) return
     setUpdating(true)
     setIsRunning(false)
 
    const totalSeconds = sessionInitialSeconds ?? plannedMinutes * 60
    const elapsedSeconds = totalSeconds - timerSeconds
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60))
    const requiredMinutes = (sessionInitialSeconds ?? plannedMinutes * 60) / 60

    await supabase
      .from("sessions")
      .update({
        completed: elapsedMinutes >= requiredMinutes && requiredMinutes >= 20,
        duration_minutes: elapsedMinutes,
      })
      .eq("id", currentSessionId)
 
    // Only grow the plant if the full planned time (>=20 minutes) was completed
    if (elapsedMinutes >= requiredMinutes && requiredMinutes >= 20) {
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
    }
    setCurrentSessionId(null)
    setSessionInitialSeconds(null)
    setTimerSeconds(plannedMinutes * 60)
     setUpdating(false)
   }
 
   const cancelSession = () => {
     setIsRunning(false)
     setCurrentSessionId(null)
    setSessionInitialSeconds(null)
    setTimerSeconds(plannedMinutes * 60)
   }
 
  const stageLabel = useMemo(
    () => plantStageLabel(todayStage),
    [todayStage],
  )
 
  if (loading)
    return (
      <div className="surface-soft rounded-xl p-10 shadow-lg shadow-black/40">
        Loading...
      </div>
    )

  return (
    <div className="relative w-full flex items-center justify-center">
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm pointer-events-none transition-opacity duration-500 ${
          isRunning ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="surface-soft rounded-xl p-10 shadow-lg shadow-black/40 w-full max-w-lg relative z-10">
        

        <div className="flex flex-col items-center gap-6">
          <div
            className={`w-48 h-48 rounded-full border-4 border-white/20 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)] ${
              isRunning ? "animate-pulse" : ""
            }`}
          >
            <span className="text-4xl font-mono">{formatTime(timerSeconds)}</span>
          </div>

          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 text-xs text-white/70">
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
                className="w-20 rounded-md border border-white/20 bg-transparent px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/60"
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
                  className="px-4 py-2 rounded-md border border-white/20 text-sm text-white/70 hover:bg-white/5 disabled:opacity-60"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-lg surface flex items-center justify-center text-2xl">
              {plantStageEmoji(todayStage)}
            </div>
            <span className="text-xs uppercase tracking-wide text-white/60">
              Today&apos;s growth: {stageLabel}
            </span>
          </div>

          {historyTiles.length > 0 && (
            <div className="mt-8 w-full">
              <h2 className="text-sm font-semibold text-white/70 mb-3">
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
                      className="flex flex-col items-center gap-1 text-xs text-white/70"
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