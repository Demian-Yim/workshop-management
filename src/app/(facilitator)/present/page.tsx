'use client';
import {
  CheckCircle, ClipboardList, UtensilsCrossed, PenLine,
  BarChart3, Star, Smartphone, Hand, Users, Megaphone,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSessionStore } from '@/hooks/useSession';
import { useAttendance } from '@/hooks/useAttendance';
import { usePosts } from '@/hooks/usePosts';
import { useSurveyResults } from '@/hooks/useSurveyResults';
import { useLunchVotes } from '@/hooks/useLunchVotes';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import type { CourseReview } from '@/types/review';
import Link from 'next/link';

export default function PresentDashboard() {
  const { courseId, sessionId, sessionCode, participantName } = useSessionStore();
  const { attendeeCount } = useAttendance();
  const { posts } = usePosts();
  const { responseCount, averageOverall } = useSurveyResults();
  const { totalVotes } = useLunchVotes();
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '';
  const { data: reviews } = useRealtimeCollection<CourseReview>(
    basePath ? `${basePath}/reviews` : '', [], !!basePath
  );

  const stats: { label: string; value: string | number; icon: LucideIcon; href: string; color: string }[] = [
    { label: '출석', value: attendeeCount, icon: CheckCircle, href: '/present/attendance', color: 'from-green-500 to-emerald-600' },
    { label: '게시글', value: posts.length, icon: ClipboardList, href: '/present/board', color: 'from-blue-500 to-blue-600' },
    { label: '점심투표', value: totalVotes, icon: UtensilsCrossed, href: '/present/lunch', color: 'from-amber-500 to-orange-600' },
    { label: '후기', value: reviews.length, icon: PenLine, href: '/present/review', color: 'from-pink-500 to-rose-600' },
    { label: '설문응답', value: responseCount, icon: BarChart3, href: '/present/survey', color: 'from-blue-500 to-violet-600' },
    { label: '평균만족도', value: averageOverall ? `${averageOverall}점` : '-', icon: Star, href: '/present/survey', color: 'from-yellow-500 to-amber-600' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">강사 대시보드</h1>
        <p className="text-slate-400">
          세션 코드: <span className="text-blue-300 font-mono font-bold text-xl">{sessionCode}</span>
          <span className="ml-4">{participantName} 강사</span>
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-6 h-6 text-slate-300" />
              <span className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </span>
            </div>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">빠른 메뉴</h2>
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
          {([
            { href: '/present/attendance', label: 'QR 출석', icon: Smartphone },
            { href: '/present/intro', label: '자기소개 보기', icon: Hand },
            { href: '/present/team', label: '팀 구성하기', icon: Users },
            { href: '/present/board', label: '게시판 보기', icon: ClipboardList },
            { href: '/present/announcements', label: '공지 보내기', icon: Megaphone },
            { href: '/present/lunch', label: '점심투표 열기', icon: UtensilsCrossed },
            { href: '/present/review', label: '후기 보기', icon: PenLine },
            { href: '/present/survey', label: '설문 열기', icon: BarChart3 },
          ] as { href: string; label: string; icon: LucideIcon }[]).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-slate-700/50 hover:bg-slate-700 rounded-lg p-4 text-center transition"
            >
              <div className="mb-2 flex justify-center"><item.icon className="w-6 h-6 text-slate-300" /></div>
              <p className="text-xs text-slate-300">{item.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
