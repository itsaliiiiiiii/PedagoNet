'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import NavButton from './navButton';
import { Home, Users, MessagesSquare, Bell, User } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-2 flex justify-between">
      <NavButton 
        icon={<Home />} 
        label="Accueil" 
        href="/feed" 
        active={pathname === '/feed'} 
      />
      <NavButton 
        icon={<Users />} 
        label="Réseau" 
        href="/network/requests" 
        active={pathname === '/network/requests'} 
      />
      <NavButton 
        icon={<MessagesSquare />} 
        label="Messages" 
        href="/messages" 
        active={pathname.startsWith('/messages')} 
      />
      <NavButton 
        icon={<Bell />} 
        label="Notifications" 
        href="/notifications" 
        active={pathname === '/notifications'} 
      />
      <NavButton 
        icon={<User />} 
        label="Profil" 
        href="/profile" 
        active={pathname === '/profile'} 
      />
    </nav>
  );
}
