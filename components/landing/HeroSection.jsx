"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/context/ThemeContext"

export function HeroSection({ isAuthed }) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <section id="home" className="relative px-6 pb-8 pt-12 md:px-16 lg:px-24 xl:px-32">
      <div
        className="relative overflow-hidden rounded-[2rem] px-6 py-16 md:px-12 md:py-20"
        style={{
          border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(71,85,105,0.28)",
          backgroundColor: isDark ? "rgba(30,41,59,0.72)" : "rgba(241,245,249,0.88)",
        }}
      >
        <Image
          src={isDark ? "/landing/hero-gradient-dark.svg" : "/landing/hero-gradient-light.svg"}
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
          <div
            className="inline-flex items-center gap-4 rounded-full px-5 py-2 text-sm font-medium shadow-sm"
            style={{
              border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(148,163,184,0.6)",
              backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(248,250,252,0.92)",
              color: isDark ? "#f1f5f9" : "#334155",
            }}
          >
            <div className="flex -space-x-2">
              <span className="h-7 w-7 rounded-full border border-white bg-[#a78bfa]" />
              <span className="h-7 w-7 rounded-full border border-white bg-[#c4b5fd]" />
              <span className="h-7 w-7 rounded-full border border-white bg-[#ddd6fe]" />
            </div>
            Verdis Focus Platform
          </div>

          <h1
            className="mt-8 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
            style={{ color: isDark ? "#f8fafc" : "#0f172a" }}
          >
            Grow your focus with a daily learning rhythm.
          </h1>
          <p
            className="mt-6 max-w-2xl text-lg"
            style={{ color: isDark ? "#cbd5e1" : "#475569" }}
          >
            Build momentum with guided focus sessions, track your progress over
            time, and turn consistency into a habit.
          </p>

          <div className="mt-10 flex w-full flex-col items-stretch justify-center gap-4 sm:w-auto sm:flex-row">
            {isAuthed ? (
              <Button href="/dashboard" className="min-h-12 px-7">
                Lock in
              </Button>
            ) : (
              <>
                <Button
                  href="/login"
                  variant="outline"
                  className="min-h-12 px-7"
                  style={{
                    borderColor: isDark ? "rgba(255,255,255,0.25)" : "#64748b",
                    backgroundColor: isDark ? "transparent" : "rgba(248,250,252,0.75)",
                    color: isDark ? "#f8fafc" : "#334155",
                  }}
                >
                  Log in
                </Button>
                <Button href="/signup" className="min-h-12 px-7">
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

