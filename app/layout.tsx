import "./globals.css"
import Header from "@/components/header"
import { ProfileProvider } from "@/context/ProfileContext"
import { ThemeProvider } from "@/context/ThemeContext"

export const metadata = {
  title: "Verdis",
  description: "Focus app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-white min-h-screen flex flex-col">
        <ThemeProvider>
          <ProfileProvider>
            <Header />
            <main className="flex-1 flex items-center justify-center max-w-4xl mx-auto px-4 py-8 w-full">
              {children}
            </main>
          </ProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}