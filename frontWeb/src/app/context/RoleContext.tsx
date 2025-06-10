"use client"
import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Role = "professor" | "student" | null

interface RoleCtx {
  role: Role
  /** used once, right after login */
  setRole: (role: Role) => void
}

const RoleContext = createContext<RoleCtx | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  // Récupérer le rôle depuis le localStorage au chargement initial
  const [role, setRole] = useState<Role>(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('userRole')
      return savedRole as Role || null
    }
    return null
  })

  // Sauvegarder le rôle dans le localStorage à chaque changement
  useEffect(() => {
    if (role) {
      localStorage.setItem('userRole', role)
    } else {
      localStorage.removeItem('userRole')
    }
  }, [role])

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

/** read-only hook (what you'll use in components) */
export function useRole(): Role {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error("useRole must be inside <RoleProvider>")
  return ctx.role
}

/** write-only hook (used exactly once after login) */
export function useSetRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error("useSetRole must be inside <RoleProvider>")
  return ctx.setRole
}

export function RoleDebug() {
  const role = useRole()
  const setRole = useSetRole()

  // 🔍 This runs every time `role` changes
  useEffect(() => {
    console.log("%c[role-debug] role =", "color: green", role)
  }, [role])

  return (
    <button
      className="fixed top-4 right-4 z-50 inline-flex items-center px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full"
    >
      Mode: {role === "professor" ? "Professeur" : role === "student" ? "Étudiant" : "Non connecté"}
    </button>
  )
}

export default RoleContext
