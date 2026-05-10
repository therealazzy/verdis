"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

export function HeroSection({ isAuthed }) {
  const handleScrollToFeatures = () => {
    const lenis = window.__lenis
    if (lenis) {
      lenis.scrollTo("#features", { offset: -76 })
      return
    }

    document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <section id="home" className="relative px-6 pb-16 pt-0 md:px-16 lg:px-24 xl:px-32">
      <div
        className="relative flex min-h-[calc(100vh-64px)] items-center overflow-hidden rounded-[2rem] bg-[rgba(241,245,249,0.88)] px-6 py-12 shadow-[0_24px_80px_rgba(15,23,42,0.22),0_8px_28px_rgba(51,65,85,0.18)] dark:bg-[rgba(30,41,59,0.72)] dark:shadow-[0_24px_80px_rgba(2,6,23,0.65),0_8px_28px_rgba(15,23,42,0.45)] md:px-12 md:py-16"
      >
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
        <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
          <div
            className="inline-flex items-center gap-4 rounded-full border border-[rgba(148,163,184,0.6)] bg-[rgba(248,250,252,0.92)] px-5 py-2 text-sm font-medium text-[#334155] shadow-sm dark:border-[rgba(255,255,255,0.2)] dark:bg-[rgba(255,255,255,0.08)] dark:text-[#f1f5f9]"
          >
            <div className="flex -space-x-2">
              <span className="h-7 w-7 rounded-full border border-white bg-[#a78bfa]" />
              <span className="h-7 w-7 rounded-full border border-white bg-[#c4b5fd]" />
              <span className="h-7 w-7 rounded-full border border-white bg-[#ddd6fe]" />
            </div>
            Verdis Focus Platform
          </div>

          <h1
            className="mt-8 text-4xl font-bold leading-tight text-[#0f172a] dark:text-[#f8fafc] sm:text-5xl lg:text-6xl"
          >
            Grow your focus with a daily learning rhythm.
          </h1>
          <p
            className="mt-6 max-w-2xl text-lg text-[#475569] dark:text-[#cbd5e1]"
          >
            Build momentum with guided focus sessions, track your progress over
            time, and turn consistency into a habit.
          </p>

          <div className="mt-10 flex w-full flex-col items-stretch justify-center gap-4 sm:w-auto sm:flex-row">
            <Button
              onClick={handleScrollToFeatures}
              variant="outline"
              className="min-h-12 border-transparent bg-[rgba(248,250,252,0.9)] px-7 text-[#334155] dark:bg-[rgba(255,255,255,0.08)] dark:text-[#f8fafc]"
            >
              Features
            </Button>
            {isAuthed ? (
              <Button href="/dashboard" className="min-h-12 px-7">
                Lock in
              </Button>
            ) : (
              <>
                <Button
                  href="/login"
                  variant="outline"
                  className="min-h-12 border-[#64748b] bg-[rgba(248,250,252,0.75)] px-7 text-[#334155] dark:border-[rgba(255,255,255,0.25)] dark:bg-transparent dark:text-[#f8fafc]"
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

