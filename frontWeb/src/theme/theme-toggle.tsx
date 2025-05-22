"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/theme/theme-provider"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="fixed right-4 top-4 z-50 h-10 w-10" aria-hidden="true" />
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md transition-all hover:scale-110 dark:bg-black/90"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-gray-800 transition-transform duration-300 ease-in-out" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-300 transition-transform duration-300 ease-in-out" />
      )}
    </button>
  )
}
