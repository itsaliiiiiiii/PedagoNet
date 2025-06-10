"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Role = 'admin' | 'user' | 'editor' | null;

interface RoleCtx {
  role: Role;
  /** used once, right after login */
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleCtx | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);          // ← default: unknown

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

/** read-only hook (what you’ll use in components) */
export function useRole(): Role {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be inside <RoleProvider>');
  return ctx.role;
}

/** write-only hook (used exactly once after login) */
export function useSetRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useSetRole must be inside <RoleProvider>');
  return ctx.setRole;
}

export  function RoleDebug() {
  const role = useRole();

  // 🔍 This runs every time `role` changes
  useEffect(() => {
    console.log('%c[role-debug] role =', 'color: green', role);
  }, [role]);

  return null;   // this component renders nothing visible
}