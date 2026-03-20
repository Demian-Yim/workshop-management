'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useMemo } from 'react';
import { orderBy } from 'firebase/firestore';
import { useRealtimeDocument } from '@/hooks/useRealtimeDocument';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import { useAttendance } from '@/hooks/useAttendance';
import { useSessionStore } from '@/hooks/useSession';
import { generateJoinQrDataUrl } from '@/lib/qr';
import { getTeamColor } from '@/lib/utils';
import type { Session, Participant } from '@/types/session';
import type { IntroCard } from '@/types/intro';
import type { Post } from '@/types/board';
import type { CourseReview } from '@/types/review';
import type { Team } from '@/types/team';
import Masonry from 'react-masonry-css';
import {
  Users, MessageSquare, UserPlus, Star,
  CheckCircle, Monitor,
} from 'lucide-react';

/** activeFeature 값과 표시 이름 매핑 */
const FEATURE_LABELS: Record<string, string> = {
  welcome: '환영',
  intro: '자기소개',
  board: '게시판',
  team: '팀 구성',
  review: '강의후기',
  attendance: '출석',
};

function DisplayContent() {
  const searchParams = useSearchParams();
  const paramCourseId = searchParams.get('courseId') ?? '';
  const paramSessionId = searchParams.get('sessionId') ?? '';

  const store = useSessionStore();
  const courseId = paramCourseId || store.courseId;
  const sessionId = paramSessionId || store.sessionId;

  // URL 파라미터가 있으면 스토어에도 반영
  useEffect(() => {
    if (paramCourseId && paramSessionId && (store.courseId !== paramCourseId || store.sessionId !== paramSessionId)) {
      store.setSession({
        courseId: paramCourseId,
        sessionId: paramSessionId,
        participantId: store.participantId || '',
        participantName: store.participantName || '',
        sessionCode: store.sessionCode || '',
        role: 'facilitator',
      });
    }
  }, [paramCourseId, paramSessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const sessionPath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '';

  const { data: session, loading: sessionLoading } = useRealtimeDocument<Session>(
    sessionPath,
    !!sessionPath
  );

  const activeFeature = session?.activeFeature ?? 'welcome';

  if (!courseId || !sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Monitor className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-xl text-slate-500">세션 정보가 없습니다</p>
          <p className="text-sm text-slate-600 mt-2">강사 대시보드에서 프로젝션 보기를 사용해주세요</p>
        </div>
      </div>
    );
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">연결 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* 상단 바 */}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-300">
          {session?.title || '워크샵'}
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">
            {FEATURE_LABELS[activeFeature] || activeFeature}
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </header>

      {/* 기능별 뷰 */}
      {activeFeature === 'welcome' && (
        <WelcomeView session={session} courseId={courseId} sessionId={sessionId} />
      )}
      {activeFeature === 'intro' && (
        <IntroView basePath={sessionPath} />
      )}
      {activeFeature === 'board' && (
        <BoardView basePath={sessionPath} />
      )}
      {activeFeature === 'team' && (
        <TeamView basePath={sessionPath} />
      )}
      {activeFeature === 'review' && (
        <ReviewView basePath={sessionPath} />
      )}
      {activeFeature === 'attendance' && (
        <AttendanceView basePath={sessionPath} />
      )}
    </div>
  );
}

/* ────────────────────────── Welcome View ────────────────────────── */
function WelcomeView({
  session,
  courseId,
  sessionId,
}: {
  session: Session | null;
  courseId: string;
  sessionId: string;
}) {
  const [qrUrl, setQrUrl] = useState('');
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '';
  const { data: participants } = useRealtimeCollection<Participant>(
    basePath ? `${basePath}/participants` : '', [], !!basePath
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && session?.sessionCode) {
      generateJoinQrDataUrl(session.sessionCode, window.location.origin).then(setQrUrl);
    }
  }, [session?.sessionCode]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <h2 className="text-5xl font-bold text-white mb-2">{session?.title || '워크샵'}</h2>
      <p className="text-xl text-slate-400 mb-12">FLOW~ 사람과 일의 흐름을 디자인합니다</p>

      <div className="flex items-center gap-16">
        {/* QR 코드 */}
        {qrUrl && (
          <div className="text-center">
            <div className="bg-white p-5 rounded-2xl inline-block shadow-xl shadow-blue-500/10">
              <img src={qrUrl} alt="Join QR" className="w-72 h-72" />
            </div>
            <p className="text-slate-500 mt-4 text-sm">QR 코드를 스캔하여 참여하세요</p>
          </div>
        )}

        {/* 세션 코드 + 참여 현황 */}
        <div className="text-center">
          <p className="text-slate-500 text-lg mb-3">세션 코드</p>
          <div className="text-7xl font-mono font-bold text-blue-400 tracking-[0.3em] mb-8">
            {session?.sessionCode}
          </div>
          <div className="bg-slate-800/50 rounded-2xl px-12 py-8 border border-slate-700">
            <div className="flex items-center gap-3 justify-center">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-5xl font-bold text-white">{participants.length}</span>
            </div>
            <p className="text-slate-400 mt-2">명 참여 중</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────── Intro View ────────────────────────── */
function IntroView({ basePath }: { basePath: string }) {
  const { data: intros, loading } = useRealtimeCollection<IntroCard>(
    basePath ? `${basePath}/introCards` : '', [], !!basePath
  );

  if (loading) return <LoadingSpinner />;
  if (intros.length === 0) return <EmptyDisplay icon={UserPlus} text="아직 자기소개가 없습니다" />;

  return (
    <Masonry
      breakpointCols={{ default: 4, 1536: 3, 1024: 2, 768: 1 }}
      className="masonry-grid"
      columnClassName="masonry-grid_column"
    >
      {intros.map((intro) => (
        <div
          key={intro.id}
          className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/50 mb-5 animate-fade-in"
        >
          <div className="flex items-center gap-4 mb-4">
            {intro.characterUrl ? (
              <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                <img src={intro.characterUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center text-2xl font-bold text-blue-300">
                {intro.participantName[0]}
              </div>
            )}
            <span className="text-lg font-semibold text-slate-100">{intro.participantName}</span>
          </div>
          <p className="text-base text-slate-300 whitespace-pre-wrap leading-relaxed">
            {intro.content}
          </p>
          {intro.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {intro.tags.map((tag, i) => (
                <span key={i} className="text-sm bg-slate-700/80 text-slate-400 px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </Masonry>
  );
}

/* ────────────────────────── Board View ────────────────────────── */
function BoardView({ basePath }: { basePath: string }) {
  const constraints = useMemo(() => [orderBy('createdAt', 'desc')], []);
  const { data: posts, loading } = useRealtimeCollection<Post>(
    basePath ? `${basePath}/posts` : '', constraints, !!basePath
  );

  if (loading) return <LoadingSpinner />;
  if (posts.length === 0) return <EmptyDisplay icon={MessageSquare} text="아직 게시글이 없습니다" />;

  return (
    <Masonry
      breakpointCols={{ default: 4, 1536: 3, 1024: 2 }}
      className="masonry-grid"
      columnClassName="masonry-grid_column"
    >
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/50 mb-5 animate-fade-in"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-base font-bold text-blue-300">
              {post.authorName[0]}
            </div>
            <span className="text-base font-medium text-slate-200">{post.authorName}</span>
          </div>
          <p className="text-base text-slate-200 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
          {post.imageUrl && (
            <div className="mt-4 rounded-xl overflow-hidden">
              <img src={post.imageUrl} alt="" className="w-full object-cover" />
            </div>
          )}
        </div>
      ))}
    </Masonry>
  );
}

/* ────────────────────────── Team View ────────────────────────── */
function TeamView({ basePath }: { basePath: string }) {
  const { data: teams, loading } = useRealtimeCollection<Team>(
    basePath ? `${basePath}/teams` : '', [], !!basePath
  );

  if (loading) return <LoadingSpinner />;
  if (teams.length === 0) return <EmptyDisplay icon={Users} text="아직 팀이 구성되지 않았습니다" />;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {teams.map((team, idx) => (
        <div
          key={team.id}
          className="bg-slate-800/80 rounded-2xl border border-slate-700/50 overflow-hidden animate-fade-in"
        >
          <div className="h-2" style={{ backgroundColor: team.color || getTeamColor(idx) }} />
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">{team.teamName}</h3>
            <div className="space-y-2">
              {team.memberNames.map((name, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-white font-bold"
                    style={{ backgroundColor: team.color || getTeamColor(idx) }}
                  >
                    {name[0]}
                  </div>
                  <span className="text-base text-slate-200">{name}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-4">{team.memberNames.length}명</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────── Review View ────────────────────────── */
function ReviewView({ basePath }: { basePath: string }) {
  const { data: reviews, loading } = useRealtimeCollection<CourseReview>(
    basePath ? `${basePath}/reviews` : '', [], !!basePath
  );

  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  if (loading) return <LoadingSpinner />;
  if (reviews.length === 0) return <EmptyDisplay icon={Star} text="아직 후기가 없습니다" />;

  return (
    <div>
      {/* 평균 평점 헤더 */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-8 h-8 ${i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
            />
          ))}
        </div>
        <p className="text-2xl font-bold text-white">{avgRating}점</p>
        <p className="text-slate-500">{reviews.length}개의 후기</p>
      </div>

      <Masonry
        breakpointCols={{ default: 3, 1280: 2, 768: 1 }}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/50 mb-5 animate-fade-in"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-medium text-slate-200">
                {review.isAnonymous ? '익명' : review.participantName}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-base text-slate-300 whitespace-pre-wrap leading-relaxed">
              {review.content}
            </p>
          </div>
        ))}
      </Masonry>
    </div>
  );
}

/* ────────────────────────── Attendance View ────────────────────────── */
function AttendanceView({ basePath }: { basePath: string }) {
  const { attendees, attendeeCount } = useAttendance();
  const { data: participants } = useRealtimeCollection<Participant>(
    basePath ? `${basePath}/participants` : '', [], !!basePath
  );

  const percentage = participants.length > 0 ? Math.round((attendeeCount / participants.length) * 100) : 0;

  return (
    <div className="flex flex-col items-center">
      {/* 대형 출석률 표시 */}
      <div className="text-center mb-12">
        <div className="relative inline-flex items-center justify-center w-48 h-48 mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="none" className="text-slate-800" />
            <circle
              cx="50" cy="50" r="45"
              stroke="currentColor" strokeWidth="6" fill="none"
              strokeDasharray={`${percentage * 2.83} ${283 - percentage * 2.83}`}
              strokeLinecap="round"
              className="text-green-500 transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white">{percentage}%</span>
            <span className="text-sm text-slate-400">{attendeeCount}/{participants.length}</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white">출석 현황</h2>
      </div>

      {/* 출석자 그리드 */}
      <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 w-full max-w-6xl">
        {attendees.map((a) => (
          <div
            key={a.id}
            className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50 text-center animate-fade-in"
          >
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-base text-green-300 font-bold mx-auto mb-2">
              {a.participantName?.[0] || '?'}
            </div>
            <p className="text-sm text-slate-300 truncate">{a.participantName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────── Shared Components ────────────────────────── */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}

function EmptyDisplay({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)]">
      <Icon className="w-20 h-20 text-slate-700 mb-6" />
      <p className="text-2xl text-slate-500">{text}</p>
      <p className="text-base text-slate-600 mt-2">학습자들의 활동이 실시간으로 표시됩니다</p>
    </div>
  );
}

/* ────────────────────────── Page Export ────────────────────────── */
export default function DisplayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      }
    >
      <DisplayContent />
    </Suspense>
  );
}
