"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { navLinks } from "@/components/landing/data"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-slate-900/5 dark:border-white/10",
        open ? "bg-transparent" : "bg-white/80 backdrop-blur-md dark:bg-slate-950/70",
      )}
    >
      <div className="px-6 md:px-16 lg:px-24 xl:px-32">
        <div className="flex h-20 items-center justify-between">
          <Link href="#home" className="inline-flex items-center">
            <Image
              src="/landing/logo-light.svg"
              alt="Logo"
              width={124}
              height={30}
              className="dark:hidden"
              priority
            />
            <Image
              src="/landing/logo-dark.svg"
              alt="Logo"
              width={124}
              height={30}
              className="hidden dark:block"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Button
              href="/login"
              variant="outline"
              className="min-h-10 border-slate-300 px-5 text-slate-700 hover:bg-slate-100 dark:border-white/30 dark:text-white dark:hover:bg-white/10"
            >
              Sign in
            </Button>
            <Button href="/signup" className="min-h-10 px-5">
              Get started
            </Button>
          </div>

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/30 dark:text-white dark:hover:bg-white/10 md:hidden"
          >
            <span className="sr-only">Open menu</span>
            ☰
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-white/80 px-6 pt-6 backdrop-blur-xl dark:bg-slate-950/80">
          <div className="flex items-center justify-between">
            <Image
              src="/landing/logo-light.svg"
              alt="Logo"
              width={124}
              height={30}
              className="dark:hidden"
            />
            <Image
              src="/landing/logo-dark.svg"
              alt="Logo"
              width={124}
              height={30}
              className="hidden dark:block"
            />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/30 dark:text-white dark:hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="mt-14 flex flex-col gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-3xl font-semibold text-slate-900 dark:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-14 flex flex-col gap-4">
            <Button
              href="/login"
              variant="outline"
              className="w-full border-slate-300 text-slate-700 dark:border-white/30 dark:text-white"
            >
              Sign in
            </Button>
            <Button href="/signup" className="w-full">
              Get started
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  )
}

