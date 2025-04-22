import { Home, Users, MessagesSquare, Bell, User } from "lucide-react";

export default function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-2 flex justify-between">
      <NavButton icon={<Home />} label="Accueil" isActive />
      <NavButton icon={<Users />} label="Réseau" />
      <NavButton icon={<MessagesSquare />} label="Messages" />
      <NavButton icon={<Bell />} label="Notifications" />
      <NavButton icon={<User />} label="Profil" />
    </nav>
  );
}

function NavButton({ icon, label, isActive = false, href = "#" }: { icon: React.ReactNode; label: string; isActive?: boolean; href?: string }) {
    return (
        <a
            href={href}
            className={`flex flex-col items-center justify-center ${
                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
            }`}
        >
            {icon}
            <span className="text-xs mt-1">{label}</span>
        </a>
    );
}