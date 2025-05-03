"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Check, X } from "lucide-react"

export default function PasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [confirmTouched, setConfirmTouched] = useState(false)

  // Calculate password strength whenever password changes
  useEffect(() => {
    calculatePasswordStrength(password)
  }, [password])

  // Check if passwords match
  const passwordsMatch = password === confirmPassword
  const showConfirmError = confirmTouched && !passwordsMatch && confirmPassword.length > 0

  const calculatePasswordStrength = (pass: string) => {
    // Start with a base score
    let strength = 0

    // No password, no strength
    if (pass.length === 0) {
      setPasswordStrength(0)
      return
    }

    // Length check (up to 40%)
    strength += Math.min(pass.length * 5, 40)

    // Complexity checks
    if (/[A-Z]/.test(pass)) strength += 15 // Has uppercase
    if (/[a-z]/.test(pass)) strength += 10 // Has lowercase
    if (/[0-9]/.test(pass)) strength += 15 // Has number
    if (/[^A-Za-z0-9]/.test(pass)) strength += 20 // Has special char

    setPasswordStrength(Math.min(strength, 100))
  }

  const getStrengthColor = () => {
    if (passwordStrength < 30) return "bg-red-500"
    if (passwordStrength < 60) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthLabel = () => {
    if (passwordStrength < 30) return "Weak"
    if (passwordStrength < 60) return "Medium"
    return "Strong"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    const email = localStorage.getItem("pendingEmail")
    const code = localStorage.getItem("otp")
    if (!email) {
      setError("No email found in local storage")
      setIsLoading(false)
      return
    }
  
    if (!password || !confirmPassword) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }
  
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }
  
    try {
      const response = await fetch("http://localhost:8080/auth/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
          password,

        }),
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        setError(data.message || "Failed to create account")
        return
      }
  
      // Success → Rediriger
      router.push("/login?registered=true")
    } catch (err) {
      console.error("Registration error:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }
  

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-800 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          {password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Password strength </span>
                <span
                  className={`font-medium ${
                    passwordStrength < 30
                      ? "text-red-500"
                      : passwordStrength < 60
                        ? "text-yellow-500"
                        : "text-green-500"
                  }`}
                >
                  {getStrengthLabel()}
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                  style={{ width: `${passwordStrength}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setConfirmTouched(true)}
              required
              className={`block w-full rounded-md border ${
                showConfirmError ? "border-red-400" : "border-gray-300 dark:border-gray-700"
              } px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm text-gray-900 dark:bg-gray-800 dark:text-white ${
                showConfirmError ? "focus:border-red-400" : "focus:border-blue-500"
              }`}
            />
            
          </div>
          {showConfirmError && <p className="mt-1 text-xs text-red-400">Passwords do not match</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading || (confirmTouched && !passwordsMatch)}
          className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  )
}
