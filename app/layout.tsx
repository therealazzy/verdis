import "./globals.css"
import { ThemeProvider } from "@/context/ThemeContext"
import Header from "@/components/header"
import { LenisProvider } from "@/components/LenisProvider"

export const metadata = {
  title: "Verdis",
  description: "Focus app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var stored=localStorage.getItem("theme");var theme=(stored==="light"||stored==="dark")?stored:"dark";var root=document.documentElement;root.setAttribute("data-theme",theme);root.classList.toggle("dark",theme==="dark");root.style.colorScheme=theme;}catch(e){var root=document.documentElement;root.setAttribute("data-theme","dark");root.classList.add("dark");root.style.colorScheme="dark";}})();`,
          }}
        />
      </head>
      <body className="text-white min-h-screen flex flex-col">
        <ThemeProvider>
          <LenisProvider />
          <Header />
          <main className="w-full flex-1 pt-16">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}