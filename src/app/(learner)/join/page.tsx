'use client';
import { Suspense, useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QrCode } from 'lucide-react';
import { validateSessionCode } from '@/lib/session';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useSessionStore } from '@/hooks/useSession';
import { generateId } from '@/lib/utils';

function JoinContent() {
  const searchParams = useSearchParams();
  const initialCode = (searchParams.get('code') ?? '').toUpperCase();
  const isQrEntry = initialCode.length === 6;

  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // QR 접속 시 이름 입력 필드에 자동 포커스
  useEffect(() => {
    if (isQrEntry && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isQrEntry]);

  const handleJoin = async () => {
    const normalized = code.trim().toUpperCase();
    if (normalized.length !== 6) { setError('6자리 세션 코드를 입력하세요'); return; }
    if (!name.trim()) { setError('이름을 입력하세요'); return; }

    setLoading(true);
    setError('');

    try {
      const result = await validateSessionCode(normalized);
      if (!result) { setError('유효하지 않은 세션 코드입니다'); setLoading(false); return; }

      const participantId = generateId();

      if (result.role === 'facilitator') {
        setSession({
          courseId: result.courseId,
          sessionId: result.sessionId,
          participantId,
          participantName: name.trim(),
          sessionCode: normalized,
          role: 'facilitator',
        });
        router.push('/present');
      } else {
        const participantRef = doc(
          db,
          `courses/${result.courseId}/sessions/${result.sessionId}/participants`,
          participantId
        );
        await setDoc(participantRef, {
          name: name.trim(),
          joinedAt: serverTimestamp(),
          sessionCode: normalized,
          teamId: null,
          isActive: true,
        });

        setSession({
          courseId: result.courseId,
          sessionId: result.sessionId,
          participantId,
          participantName: name.trim(),
          sessionCode: normalized,
          role: 'learner',
        });
        router.push('/session');
      }
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
          {isQrEntry ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <QrCode className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">QR 스캔 완료</h1>
              <p className="text-slate-500 mt-1">이름만 입력하면 바로 참여할 수 있어요</p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">🎓</div>
              <h1 className="text-2xl font-bold text-slate-900">워크샵 참여</h1>
              <p className="text-slate-500 mt-1">세션 코드와 이름을 입력하세요</p>
            </>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">세션 코드</label>
            {isQrEntry ? (
              <div className="w-full text-center text-3xl font-bold tracking-[0.3em] px-4 py-4 bg-slate-50 border-2 border-green-300 rounded-xl text-slate-900">
                {code}
              </div>
            ) : (
              <input
                type="text"
                inputMode="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="6자리 코드"
                className="w-full text-center text-3xl font-bold tracking-[0.3em] px-4 py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              maxLength={50}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && code.length === 6 && name.trim()) handleJoin();
              }}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            onClick={handleJoin}
            disabled={loading || code.length !== 6 || !name.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition text-lg"
          >
            {loading ? '참여 중...' : '참여하기'}
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">
          {isQrEntry ? 'QR 코드로 세션 코드가 자동 입력되었습니다' : '강사에게 받은 6자리 세션 코드를 입력하세요'}
        </p>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-50">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
