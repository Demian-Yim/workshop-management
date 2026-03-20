'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateSessionCode } from '@/lib/session';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useSessionStore } from '@/hooks/useSession';
import { generateId } from '@/lib/utils';

export default function JoinPage() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);

  const handleJoin = async () => {
    if (code.length !== 4) { setError('4자리 세션 코드를 입력하세요'); return; }
    if (!name.trim()) { setError('이름을 입력하세요'); return; }

    setLoading(true);
    setError('');

    try {
      const result = await validateSessionCode(code);
      if (!result) { setError('유효하지 않은 세션 코드입니다'); setLoading(false); return; }

      const participantId = generateId();
      const participantRef = doc(
        db,
        `courses/${result.courseId}/sessions/${result.sessionId}/participants`,
        participantId
      );
      await setDoc(participantRef, {
        name: name.trim(),
        joinedAt: serverTimestamp(),
        sessionCode: code,
        teamId: null,
        isActive: true,
      });

      setSession({
        courseId: result.courseId,
        sessionId: result.sessionId,
        participantId,
        participantName: name.trim(),
        sessionCode: code,
        role: 'learner',
      });

      router.push('/session');
    } catch {
      setError('참여 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎓</div>
          <h1 className="text-2xl font-bold text-slate-900">워크샵 참여</h1>
          <p className="text-slate-500 mt-1">세션 코드와 이름을 입력하세요</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">세션 코드</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="4자리 코드"
              className="w-full text-center text-3xl font-bold tracking-[0.5em] px-4 py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-lg"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            onClick={handleJoin}
            disabled={loading || code.length !== 4 || !name.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition text-lg"
          >
            {loading ? '참여 중...' : '참여하기'}
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">
          강사에게 받은 4자리 세션 코드를 입력하세요
        </p>
      </div>
    </div>
  );
}
