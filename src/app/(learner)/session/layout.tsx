'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, MessageSquare, UtensilsCrossed, Bell, BarChart3, LogOut, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSessionStore, useSessionHydrated } from '@/hooks/useSession';
import { useRealtimeDocument } from '@/hooks/useRealtimeDocument';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import type { Session } from '@/types/session';
import type { Announcement } from '@/types/announcement';
import { orderBy } from 'firebase/firestore';
import { useEffect, useMemo, useRef, useState } from 'react';

const LAST_SEEN_KEY = 'announcements_last_seen_at';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/session', label: '홈', icon: Home },
  { href: '/session/board', label: '게시판', icon: MessageSquare },
  { href: '/session/lunch', label: '점심', icon: UtensilsCrossed },
  { href: '/session/announcements', label: '공지', icon: Bell },
  { href: '/session/survey', label: '설문', icon: BarChart3 },
  { href: '/session/activities', label: '활동', icon: Zap },
];

export default function LearnerSessionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useSessionHydrated();
  const { courseId, sessionId, participantName, sessionCode, setSessionData, clearSession } = useSessionStore();

  const hasSession = !!(courseId && sessionId && sessionCode);

  const { data: session } = useRealtimeDocument<Session>(
    courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '',
    !!(courseId && sessionId)
  );

  const announcementPath = courseId && sessionId
    ? `courses/${courseId}/sessions/${sessionId}/announcements`
    : '';
  const announcementConstraints = useMemo(() => [orderBy('createdAt', 'desc')], []);
  const { data: announcements } = useRealtimeCollection<Announcement>(
    announcementPath, announcementConstraints, !!announcementPath
  );

  const lastSeenAtRef = useRef<number>(0);
  const [lastSeenAt, setLastSeenAt] = useState<number>(0);

  // Load last-seen timestamp from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem(LAST_SEEN_KEY);
    const value = stored ? Number(stored) : 0;
    lastSeenAtRef.current = value;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
    setLastSeenAt(value);
  }, []);

  // Mark all as seen when the user is on the announcements page
  useEffect(() => {
    if (pathname === '/session/announcements') {
      const now = Date.now();
      localStorage.setItem(LAST_SEEN_KEY, String(now));
      lastSeenAtRef.current = now;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync localStorage change to render
      setLastSeenAt(now);
    }
  }, [pathname]);

  const unreadCount = announcements.filter((ann) => {
    if (!ann.createdAt) return false;
    return ann.createdAt.toMillis() > lastSeenAt;
  }).length;

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
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
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
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              {session?.sessionCode || sessionCode || '----'}
            </span>
            <button
              onClick={() => { clearSession(); router.replace('/join'); }}
              title="세션 나가기"
              className="p-1.5 text-slate-400 hover:text-red-500 transition rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-sm bg-white/90 border-t border-slate-200 z-40">
        <div className="flex justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const badge = item.href === '/session/announcements' && unreadCount > 0 ? unreadCount : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 px-3 text-xs transition ${
                  isActive
                    ? 'text-blue-600 border-t-2 border-blue-500'
                    : 'text-slate-400 hover:text-slate-600 border-t-2 border-transparent'
                }`}
              >
                <span className="relative">
                  <Icon className="w-5 h-5 mb-0.5" />
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none px-0.5">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </span>
                <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
