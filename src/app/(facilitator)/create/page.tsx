'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { generateSessionCode } from '@/lib/session';
import { useSessionStore } from '@/hooks/useSession';
import { useAuth } from '@/hooks/useAuth';
import { generateId } from '@/lib/utils';

type CreatingStep = '과정 생성 중...' | '세션 생성 중...' | '코드 등록 중...' | null;

export default function CreateSessionPage() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const { user, loading: authLoading } = useAuth();
  const [courseTitle, setCourseTitle] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [facilitatorName, setFacilitatorName] = useState('');
  const [creating, setCreating] = useState(false);
  const [creatingStep, setCreatingStep] = useState<CreatingStep>(null);
  const [error, setError] = useState('');

  // Prevents duplicate submissions on rapid double-click
  const isSubmittingRef = useRef(false);

  const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('요청 시간이 초과되었습니다. 네트워크를 확인하세요.')), ms)
    );
    return Promise.race([promise, timeout]);
  };

  const handleCreate = async () => {
    if (isSubmittingRef.current) return; // guard against double-click
    if (!courseTitle.trim() || !sessionTitle.trim() || !facilitatorName.trim()) {
      setError('모든 필드를 입력하세요');
      return;
    }

    isSubmittingRef.current = true;
    setCreating(true);
    setError('');

    try {
      const facilitatorId = generateId();
      const sessionCode = generateSessionCode();

      setCreatingStep('과정 생성 중...');
      const courseRef = await withTimeout(
        addDoc(collection(db, 'courses'), {
          title: courseTitle.trim(),
          description: '',
          startDate: Timestamp.now(),
          endDate: Timestamp.now(),
          facilitatorId,
          facilitatorName: facilitatorName.trim(),
          status: 'active',
          createdAt: serverTimestamp(),
          createdBy: facilitatorId,
        }),
        15000
      );

      setCreatingStep('세션 생성 중...');
      const sessionRef = await withTimeout(
        addDoc(
          collection(db, `courses/${courseRef.id}/sessions`),
          {
            courseId: courseRef.id,
            date: Timestamp.now(),
            dayNumber: 1,
            sessionCode,
            title: sessionTitle.trim(),
            status: 'active',
            activeFeature: null,
            facilitatorId,
            settings: {
              attendanceOpen: true,
              boardOpen: true,
              lunchPollOpen: false,
              reviewOpen: true,
              surveyOpen: false,
              introOpen: true,
            },
            createdAt: serverTimestamp(),
          }
        ),
        15000
      );

      setCreatingStep('코드 등록 중...');
      await withTimeout(
        setDoc(doc(db, 'sessionCodes', sessionCode), {
          courseId: courseRef.id,
          sessionId: sessionRef.id,
          role: 'learner' as const,
          createdAt: serverTimestamp(),
          expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
        }),
        15000
      );

      setSession({
        courseId: courseRef.id,
        sessionId: sessionRef.id,
        participantId: facilitatorId,
        participantName: facilitatorName.trim(),
        sessionCode,
        role: 'facilitator',
      });

      router.push('/present');
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : '세션 생성 중 오류가 발생했습니다';
      setError(message);
      isSubmittingRef.current = false;
    } finally {
      setCreating(false);
      setCreatingStep(null);
    }
  };

  // Auth guard — middleware provides first-pass redirect; this is the
  // authoritative client-side check so the page never renders for guests.
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.replace('/login?redirect=/create');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎤</div>
          <h1 className="text-2xl font-bold text-slate-900">세션 생성</h1>
          <p className="text-slate-500 mt-1">새로운 워크샵 세션을 만드세요</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">강사 이름</label>
              <span className="text-xs text-slate-400">{facilitatorName.length}/50</span>
            </div>
            <input
              type="text"
              value={facilitatorName}
              onChange={(e) => setFacilitatorName(e.target.value)}
              placeholder="홍길동 강사"
              maxLength={50}
              disabled={creating}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition disabled:bg-slate-50"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">교육과정명</label>
              <span className="text-xs text-slate-400">{courseTitle.length}/100</span>
            </div>
            <input
              type="text"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="리더십 워크샵"
              maxLength={100}
              disabled={creating}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition disabled:bg-slate-50"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">세션 제목</label>
              <span className="text-xs text-slate-400">{sessionTitle.length}/100</span>
            </div>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Day 1 - 오리엔테이션"
              maxLength={100}
              disabled={creating}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition disabled:bg-slate-50"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {creating && creatingStep && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-4 py-2">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
              <span>{creatingStep}</span>
            </div>
          )}
          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition text-lg"
          >
            {creating ? '생성 중...' : '세션 생성하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
