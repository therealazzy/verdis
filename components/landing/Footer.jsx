import Image from "next/image"
import Link from "next/link"

const companyLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Profile", href: "/profile" },
  { label: "Log in", href: "/login" },
  { label: "Sign up", href: "/signup" },
]

export function Footer() {
  return (
    <footer className="relative mt-12 border-t border-black/20 px-6 pb-10 pt-20 dark:border-white/10 md:px-16 lg:px-24 xl:px-32">
      <Image
        src="/landing/footer-text-light.svg"
        alt=""
        width={1200}
        height={200}
        className="pointer-events-none absolute left-1/2 top-0 -z-10 w-full max-w-6xl -translate-x-1/2 dark:hidden"
      />
      <Image
        src="/landing/footer-text-dark.svg"
        alt=""
        width={1200}
        height={200}
        className="pointer-events-none absolute left-1/2 top-0 -z-10 hidden w-full max-w-6xl -translate-x-1/2 dark:block"
      />

      <div className="grid gap-12 md:grid-cols-[1.2fr_1fr]">
        <div>
          <h3 className="text-2xl font-semibold text-black dark:text-white">Verdis</h3>
          <p className="mt-4 max-w-md text-sm leading-7 text-black dark:text-slate-300">
            Verdis helps you build a daily focus rhythm with guided sessions, progress tracking, and
            consistent habits.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black dark:text-white">
              Company
            </p>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-black transition-colors hover:text-black/70 dark:text-slate-300 dark:hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black dark:text-white">
              Contact
            </p>
            <ul className="mt-4 space-y-3 text-sm text-black dark:text-slate-300">
              <li>hello@verdis.app</li>
            </ul>
          </div>
        </div>
      </div>

      <p className="mt-14 text-center text-sm text-black dark:text-slate-400">
        Copyright 2026 Verdis. All rights reserved.
      </p>
    </footer>
  )
}

