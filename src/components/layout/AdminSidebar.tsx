'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: '대시보드', icon: '📊' },
  { href: '/dashboard/courses', label: '교육과정', icon: '📚' },
  { href: '/dashboard/facilitators', label: '강사관리', icon: '👨‍🏫' },
  { href: '/dashboard/reports', label: '리포트', icon: '📈' },
];

interface AdminSidebarProps {
  userName?: string;
  onSignOut?: () => void;
}

export default function AdminSidebar({ userName, onSignOut }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">Workshop Admin</h1>
        {userName && (
          <p className="text-sm text-slate-400 mt-1">{userName}</p>
        )}
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition',
                  pathname === item.href
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {onSignOut && (
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onSignOut}
            className="w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            로그아웃
          </button>
        </div>
      )}
    </aside>
  );
}
