import "./globals.css"
import Header from "@/components/header"
import { ProfileProvider } from "@/context/ProfileContext"

export const metadata = {
  title: "Verdis",
  description: "Focus app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProfileProvider>
        <Header />
        <main>{children}</main>
        </ProfileProvider>
      </body>
    </html>
  )
}