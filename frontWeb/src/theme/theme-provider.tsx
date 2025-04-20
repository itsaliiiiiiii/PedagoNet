"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Use state but don't set a default value yet
  const [theme, setTheme] = useState<Theme | undefined>(undefined)
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage only on the client side
  useEffect(() => {
    // Mark as mounted
    setMounted(true)

    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem("theme") as Theme | null
    setTheme(savedTheme || "light")
  }, [])

  // Apply the theme class based on the current theme
  useEffect(() => {
    if (!mounted || theme === undefined) return

    const root = document.documentElement

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

      root.classList.remove("light", "dark")
      root.classList.add(systemTheme)
    } else {
      root.classList.remove("light", "dark")
      root.classList.add(theme)
    }

    localStorage.setItem("theme", theme)
  }, [theme, mounted])

  // Toggle between light and dark
  const toggleTheme = () => {
    if (!mounted || theme === undefined) return

    setTheme((prevTheme) => {
      if (prevTheme === "light") return "dark"
      if (prevTheme === "dark") return "light"

      // If system, toggle based on current system preference
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      return systemTheme === "dark" ? "light" : "dark"
    })
  }

  // Create a safe version of setTheme that only works when mounted
  const safeSetTheme = (newTheme: Theme) => {
    if (mounted) {
      setTheme(newTheme)
    }
  }

  // Provide a value object that doesn't change between server and client
  // Use empty functions and default values for server rendering
  const value = {
    theme: theme || "light",
    toggleTheme: mounted ? toggleTheme : () => {},
    setTheme: mounted ? safeSetTheme : () => {},
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
