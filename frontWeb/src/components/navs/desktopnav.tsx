import Link from "next/link";
import { ChevronDown, Search, User,Home, Users, MessagesSquare, Bell  } from "lucide-react";

import Logo from "@/components/logo";

export default function DesktopNav() {
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Search */}
          <div className="flex items-center gap-3 flex-1">
            <Link href="/home" className="flex items-center gap-2">
              <Logo />
              <span className="hidden sm:inline text-lg font-semibold text-gray-900 dark:text-white">
                SchoolConnect
              </span>
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
          <nav className="hidden sm:flex items-center gap-1 sm:gap-2">
          <NavItem icon={<Home />} label="Accueil" href="/home"/>
              <NavItem icon={<Users />} label="Réseau" href="/home"  />
              <NavItem icon={<MessagesSquare />} label="Discussions" href="" isActive />
              <NavItem icon={<Bell />} label="Notifications" href="/home"/>
            <div className="flex items-center pl-5 border-l border-gray-300 dark:border-gray-600">
              <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600 dark:text-gray-300" />
              </div>
              <div className="hidden sm:flex items-center text-xs text-gray-700 dark:text-gray-300">
                <span className="mx-1">Moi</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavItem({ icon, label, href, isActive = false }: { icon: React.ReactNode; label: string; href: string; isActive?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center px-1 sm:px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
        isActive
          ? "text-black dark:text-white border-b-2 border-black dark:border-white"
          : "text-gray-500 dark:text-gray-400"
      }`}
    >
      <div className="relative">{icon}</div>
      <span className="hidden sm:block text-xs mt-0.5">{label}</span>
    </Link>
  );
}