'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { generateSessionCode } from '@/lib/session';
import { useSessionStore } from '@/hooks/useSession';
import { generateId } from '@/lib/utils';

export default function CreateSessionPage() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const [courseTitle, setCourseTitle] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [facilitatorName, setFacilitatorName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!courseTitle.trim() || !sessionTitle.trim() || !facilitatorName.trim()) {
      setError('모든 필드를 입력하세요');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const facilitatorId = generateId();
      const sessionCode = generateSessionCode();

      const courseRef = await addDoc(collection(db, 'courses'), {
        title: courseTitle.trim(),
        description: '',
        startDate: Timestamp.now(),
        endDate: Timestamp.now(),
        facilitatorId,
        facilitatorName: facilitatorName.trim(),
        status: 'active',
        createdAt: serverTimestamp(),
        createdBy: facilitatorId,
      });

      const sessionRef = await addDoc(
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
      );

      await setDoc(doc(db, 'sessionCodes', sessionCode), {
        courseId: courseRef.id,
        sessionId: sessionRef.id,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      });

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
      setError('세션 생성 중 오류가 발생했습니다');
    } finally {
      setCreating(false);
    }
  };

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
            <label className="block text-sm font-medium text-slate-700 mb-1">강사 이름</label>
            <input
              type="text"
              value={facilitatorName}
              onChange={(e) => setFacilitatorName(e.target.value)}
              placeholder="홍길동 강사"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">교육과정명</label>
            <input
              type="text"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="리더십 워크샵"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">세션 제목</label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Day 1 - 오리엔테이션"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
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
