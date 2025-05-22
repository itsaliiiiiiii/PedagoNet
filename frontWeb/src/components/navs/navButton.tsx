import Link from 'next/link';
export default function NavButton({ 
    icon, 
    label, 
    href, 
    active = false 
  }: { 
    icon: React.ReactNode; 
    label: string; 
    href: string; 
    active?: boolean 
  }) {
    return (
      <Link
        href={href}
        className={`flex flex-col items-center justify-center px-1 sm:px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
          active
            ? "text-blue-500 dark:text-white border-b-2 border-blue-500 dark:border-white"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        <div className="relative">{icon}</div>
        <span className="hidden sm:block text-xs mt-0.5">{label}</span>
      </Link>
    );
  }