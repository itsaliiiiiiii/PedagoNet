import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/theme/theme-provider"
import ThemeToggle from "@/theme/theme-toggle"
import { RoleProvider } from "@/app/context/RoleContext"
import {RoleDebug} from "@/app/context/RoleContext"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "School Connect",
  description: "Connect with your school community",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} transition-colors duration-300 dark:bg-black`}>
        <ThemeProvider>
          <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-black dark:to-gray-900">
            <ThemeToggle />
            <RoleProvider>
            <RoleDebug />
            {children}
            </RoleProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

