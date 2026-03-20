'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  CheckCircle,
  UserPlus,
  Users,
  MessageSquare,
  Megaphone,
  UtensilsCrossed,
  PenLine,
  BarChart3,
  Monitor,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSessionStore } from '@/hooks/useSession';
import { useRealtimeDocument } from '@/hooks/useRealtimeDocument';
import { useAttendance } from '@/hooks/useAttendance';
import type { Session } from '@/types/session';
import { useEffect } from 'react';

interface FeatureItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const features: FeatureItem[] = [
  { href: '/present', label: '대시보드', icon: LayoutDashboard },
  { href: '/present/attendance', label: '출석', icon: CheckCircle },
  { href: '/present/intro', label: '자기소개', icon: UserPlus },
  { href: '/present/team', label: '팀 구성', icon: Users },
  { href: '/present/board', label: '게시판', icon: MessageSquare },
  { href: '/present/announcements', label: '공지', icon: Megaphone },
  { href: '/present/lunch', label: '점심', icon: UtensilsCrossed },
  { href: '/present/review', label: '후기', icon: PenLine },
  { href: '/present/survey', label: '설문', icon: BarChart3 },
];

export default function PresentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { courseId, sessionId, sessionCode, setSessionData } = useSessionStore();
  const { attendeeCount } = useAttendance();

  const { data: session } = useRealtimeDocument<Session>(
    courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '',
    !!(courseId && sessionId)
  );

  useEffect(() => {
    if (session) setSessionData(session);
  }, [session, setSessionData]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-800 border-r border-slate-700 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-700">
          <h1 className="font-bold text-sm text-slate-200">{session?.title || '워크샵'}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-mono font-bold text-lg">
              {sessionCode}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">{attendeeCount}명 참여 중</p>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {features.map((f) => {
            const isActive = pathname === f.href;
            return (
              <Link
                key={f.href}
                href={f.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-300 border-r-2 border-blue-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <f.icon className="w-4 h-4" />
                <span>{f.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700 space-y-3">
          <a
            href={`/display?courseId=${courseId}&sessionId=${sessionId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded-lg text-sm font-medium transition w-full"
          >
            <Monitor className="w-4 h-4" />
            프로젝션 보기
          </a>
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition block">
            홈으로 돌아가기
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
