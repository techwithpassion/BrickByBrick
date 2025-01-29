import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Brick By Brick - Student Study Platform",
  description: "A comprehensive platform for students to manage their studies, collaborate with peers, and track their progress.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
