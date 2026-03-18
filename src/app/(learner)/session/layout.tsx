'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSessionStore, useSessionHydrated } from '@/hooks/useSession';
import { useRealtimeDocument } from '@/hooks/useRealtimeDocument';
import type { Session } from '@/types/session';
import { useEffect } from 'react';

const navItems = [
  { href: '/session', label: '홈', icon: '🏠' },
  { href: '/session/board', label: '게시판', icon: '📋' },
  { href: '/session/lunch', label: '점심', icon: '🍱' },
  { href: '/session/announcements', label: '공지', icon: '📢' },
  { href: '/session/survey', label: '설문', icon: '📊' },
];

export default function LearnerSessionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useSessionHydrated();
  const { courseId, sessionId, participantName, sessionCode, setSessionData } = useSessionStore();

  const hasSession = !!(courseId && sessionId && sessionCode);

  const { data: session } = useRealtimeDocument<Session>(
    courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '',
    !!(courseId && sessionId)
  );

  useEffect(() => {
    if (session) setSessionData(session);
  }, [session, setSessionData]);

  // Redirect to join if no session after hydration
  useEffect(() => {
    if (hydrated && !hasSession) {
      router.replace('/join');
    }
  }, [hydrated, hasSession, router]);

  // Loading during hydration
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!hasSession) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="font-bold text-slate-900 text-sm">{session?.title || '워크샵'}</h1>
            <p className="text-xs text-slate-500">{participantName}</p>
          </div>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
            {session?.sessionCode || sessionCode || '----'}
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <div className="flex justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 px-3 text-xs transition ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className="text-lg mb-0.5">{item.icon}</span>
                <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
