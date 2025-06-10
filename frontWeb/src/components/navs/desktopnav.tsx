"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import NavButton from "@/components/navs/navButton"
import { useState, useEffect, useRef } from "react"
import { ChevronDown, Search, User, Home, Users, MessagesSquare, Bell, Settings, LogOut, BookOpen } from "lucide-react"
import Logo from "@/components/logo"

export default function DesktopNav() {
  const pathname = usePathname()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3 flex-1">
            <Link href="/home" className="flex items-center gap-2">
              <Logo />
              <span className="hidden sm:inline text-sm font-bold text-slate-600 dark:text-white">ENSAConnect</span>
            </Link>
            <div className="relative flex-1 max-w-xs ml-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                aria-label="Rechercher dans SchoolConnect"
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center ml-6 gap-1 sm:gap-2">
            <NavButton icon={<Home />} label="Accueil" href="/home" active={pathname === "/home"} />
            <NavButton
              icon={<Users />}
              label="Réseau"
              href="/network/requests"
              active={pathname === "/network/requests"}
            />
            <NavButton
              icon={<BookOpen />}
              label="Classroom"
              href="/classroom"
              active={pathname.startsWith("/classroom")}
            />
            <NavButton
              icon={<MessagesSquare />}
              label="Discussions"
              href="/messages"
              active={pathname.startsWith("/messages")}
            />
            <NavButton
              icon={<Bell />}
              label="Notifications"
              href="/notifications"
              active={pathname === "/notifications"}
            />
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center pl-5 border-l border-gray-300 dark:border-gray-600 focus:outline-none"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600 dark:text-gray-300" />
                </div>
                <div className="hidden sm:flex items-center text-xs text-gray-700 dark:text-gray-300">
                  <span className="mx-1">Moi</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isProfileMenuOpen ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Profil
                    </div>
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Paramètres
                    </div>
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      console.log("Déconnexion")
                      setIsProfileMenuOpen(false)
                    }}
                  >
                    <div className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
