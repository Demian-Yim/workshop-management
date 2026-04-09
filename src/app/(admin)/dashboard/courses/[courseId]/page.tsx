'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  doc, updateDoc, deleteDoc, addDoc, setDoc,
  collection, getDocs, serverTimestamp, Timestamp, onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { deleteSubcollections } from '@/lib/firebase/firestore';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import { generateSessionCode } from '@/lib/session';
import type { Course, Session } from '@/types/session';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/components/ui/toast';

/* ── 단일 문서 실시간 구독 ── */
function useCourseDoc(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    const unsub = onSnapshot(doc(db, 'courses', courseId), (snap) => {
      setCourse(snap.exists() ? ({ id: snap.id, ...snap.data() } as Course) : null);
      setLoading(false);
    });
    return () => unsub();
  }, [courseId]);

  return { course, loading };
}

/* ── 상태 라벨 ── */
const courseStatusMap: Record<string, { text: string; color: string }> = {
  draft:     { text: '준비 중', color: 'bg-yellow-100 text-yellow-700' },
  active:    { text: '진행 중', color: 'bg-emerald-100 text-emerald-700' },
  completed: { text: '완료',    color: 'bg-slate-100 text-slate-500' },
};

const sessionStatusMap: Record<string, { text: string; color: string }> = {
  waiting: { text: '대기',    color: 'bg-yellow-100 text-yellow-700' },
  active:  { text: '진행 중', color: 'bg-emerald-100 text-emerald-700' },
  closed:  { text: '종료',    color: 'bg-slate-100 text-slate-500' },
};

/* ════════════════════════════════════════════════════════ */
export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const { course, loading: courseLoading } = useCourseDoc(courseId);
  const { data: sessions, loading: sessionsLoading } = useRealtimeCollection<Session>(
    `courses/${courseId}/sessions`, [], !!courseId,
  );

  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionTitle, setSessionTitle]       = useState('');
  const [sessionDate, setSessionDate]         = useState('');
  const [creating, setCreating]               = useState(false);
  const [deleting, setDeleting]               = useState(false);

  const sortedSessions = [...sessions].sort((a, b) => a.dayNumber - b.dayNumber);

  /* ── 세션 생성: 학습자/강사 코드를 각각 발급하고 sessionCodes에 등록 ── */
  const handleCreateSession = async () => {
    if (!sessionTitle.trim()) return;
    setCreating(true);
    try {
      const learnerCode     = generateSessionCode();
      const facilitatorCode = generateSessionCode();
      const dayNumber       = sessions.length + 1;
      const dateTs          = sessionDate ? Timestamp.fromDate(new Date(sessionDate)) : Timestamp.now();
      const expiresAt       = Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

      // 1) sessions 서브컬렉션에 세션 문서 생성
      const sessionRef = await addDoc(collection(db, 'courses', courseId, 'sessions'), {
        courseId,
        date: dateTs,
        dayNumber,
        sessionCode: learnerCode,
        facilitatorCode,
        title: sessionTitle.trim(),
        status: 'waiting',
        activeFeature: null,
        facilitatorId: course?.facilitatorId || '',
        settings: {
          attendanceOpen: false, boardOpen: false,
          lunchPollOpen: false, lunchOrderOpen: false,
          reviewOpen: false, surveyOpen: false, introOpen: false,
        },
        createdAt: serverTimestamp(),
      });

      // 2) sessionCodes 컬렉션에 코드→세션 매핑 등록 (코드 문자열을 문서 ID로 사용)
      await Promise.all([
        setDoc(doc(db, 'sessionCodes', learnerCode), {
          courseId, sessionId: sessionRef.id, role: 'learner' as const,
          createdAt: serverTimestamp(), expiresAt,
        }),
        setDoc(doc(db, 'sessionCodes', facilitatorCode), {
          courseId, sessionId: sessionRef.id, role: 'facilitator' as const,
          createdAt: serverTimestamp(), expiresAt,
        }),
      ]);

      setSessionTitle('');
      setSessionDate('');
      setShowSessionForm(false);
    } catch (err) {
      console.error('Session creation error:', err);
      toast.error('세션 생성에 실패했습니다');
    }
    setCreating(false);
  };

  /* ── 교육과정 삭제 (하위 세션 + 서브컬렉션 재귀 삭제) ── */
  const SESSION_SUBCOLLECTIONS = [
    'participants', 'attendance', 'introCards', 'posts', 'teams',
    'announcements', 'lunchPoll', 'lunchVotes', 'restaurants',
    'menuOrders', 'reviews', 'surveyResponses',
  ];

  const handleDeleteCourse = async () => {
    if (!confirm('이 교육과정을 삭제하시겠습니까?\n(하위 세션도 모두 삭제됩니다)')) return;
    setDeleting(true);
    try {
      // 1) 각 세션의 서브컬렉션 삭제 후 세션 문서 삭제
      const sessionsRef = collection(db, 'courses', courseId, 'sessions');
      const sessionsSnap = await getDocs(sessionsRef);

      for (const sessionDoc of sessionsSnap.docs) {
        const sessionPath = `courses/${courseId}/sessions/${sessionDoc.id}`;
        await deleteSubcollections(sessionPath, SESSION_SUBCOLLECTIONS);
        await deleteDoc(doc(db, sessionPath));
      }

      // 2) 코스 문서 삭제
      await deleteDoc(doc(db, 'courses', courseId));
      router.push('/dashboard/courses');
    } catch (err) {
      console.error(err);
      toast.error('삭제에 실패했습니다');
    }
    setDeleting(false);
  };

  /* ── 상태 변경 ── */
  const handleStatusChange = async (status: 'draft' | 'active' | 'completed') => {
    try {
      await updateDoc(doc(db, 'courses', courseId), { status });
    } catch (err) {
      console.error(err);
      toast.error('상태 변경에 실패했습니다');
    }
  };

  /* ── 로딩 ── */
  if (courseLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="animate-fade-in text-center py-12">
        <p className="text-slate-500 text-lg mb-4">교육과정을 찾을 수 없습니다</p>
        <Link href="/dashboard/courses" className="text-blue-600 hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const currentStatus = courseStatusMap[course.status] || courseStatusMap.draft;

  /* ── 렌더 ── */
  return (
    <div className="animate-fade-in">
      {/* 브레드크럼 */}
      <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
        <Link href="/dashboard/courses" className="hover:text-blue-600 transition">교육과정</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{course.title}</span>
      </div>

      {/* 교육과정 정보 카드 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{course.title}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>👤 {course.facilitatorName} 강사</span>
              <span>📅 {formatDate(course.startDate)}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${currentStatus.color}`}>
                {currentStatus.text}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {course.status !== 'active' && (
              <button onClick={() => handleStatusChange('active')}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition">
                진행 시작
              </button>
            )}
            {course.status === 'active' && (
              <button onClick={() => handleStatusChange('completed')}
                className="px-3 py-1.5 bg-slate-600 text-white text-xs rounded-lg hover:bg-slate-700 transition">
                완료 처리
              </button>
            )}
            <button onClick={handleDeleteCourse} disabled={deleting}
              className="px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100 transition">
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      </div>

      {/* 세션 목록 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          세션 목록 <span className="text-sm font-normal text-slate-400">({sessions.length}개)</span>
        </h2>
        <button onClick={() => setShowSessionForm(!showSessionForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
          + 세션 추가
        </button>
      </div>

      {/* 세션 추가 폼 */}
      {showSessionForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200 mb-4 animate-slide-up">
          <h3 className="font-semibold text-slate-900 mb-3">새 세션 (Day {sessions.length + 1})</h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="세션 제목 (예: Day 1 - 오리엔테이션)"
              maxLength={100}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
            <input type="date" value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreateSession} disabled={creating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
              {creating ? '추가 중...' : '추가'}
            </button>
            <button onClick={() => setShowSessionForm(false)} className="px-4 py-2 text-slate-500 text-sm">취소</button>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            💡 세션을 추가하면 학습자용/강사용 6자리 세션코드가 각각 자동 생성됩니다.
          </p>
        </div>
      )}

      {/* 세션 리스트 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {sessionsLoading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div className="space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-24" /></div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : sortedSessions.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            아직 세션이 없습니다. 위의 &quot;+ 세션 추가&quot; 버튼으로 생성하세요.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedSessions.map((session) => {
              const sStatus = sessionStatusMap[session.status] || sessionStatusMap.waiting;
              return (
                <div key={session.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition">
                  <div>
                    <h3 className="font-medium text-slate-900">
                      Day {session.dayNumber}: {session.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      📅 {formatDate(session.date)} | 🔑 학습자:{' '}
                      <span className="font-mono font-bold text-blue-600">{session.sessionCode}</span>
                      {session.facilitatorCode && (
                        <> | 🔐 강사:{' '}
                          <span className="font-mono font-bold text-emerald-600">{session.facilitatorCode}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${sStatus.color}`}>
                      {sStatus.text}
                    </span>
                    <Link href={`/present?code=${session.sessionCode}`}
                      className="text-xs text-blue-600 hover:underline">발표모드 →</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
