"use client"

import { useEffect } from "react"

export function LandingScrollbarToggle() {
  useEffect(() => {
    document.documentElement.classList.add("landing-scroll-hidden")
    document.body.classList.add("landing-scroll-hidden")

    return () => {
      document.documentElement.classList.remove("landing-scroll-hidden")
      document.body.classList.remove("landing-scroll-hidden")
    }
  }, [])

  return null
}
