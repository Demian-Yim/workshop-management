'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, Users, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/dashboard/courses', label: '교육과정', icon: BookOpen },
  { href: '/dashboard/facilitators', label: '강사 관리', icon: Users },
  { href: '/dashboard/reports', label: '리포트', icon: BarChart3 },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-60 space-y-4 p-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
  if (!user) { router.push('/login'); return null; }

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-200">
          <h1 className="font-bold text-lg text-slate-900">교육 관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 font-semibold border-r-2 border-purple-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200 space-y-2">
          <Link href="/" className="block text-xs text-slate-400 hover:text-slate-600 transition">홈으로</Link>
          <button onClick={handleSignOut} className="text-xs text-red-400 hover:text-red-600 transition">로그아웃</button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
