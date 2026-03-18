'use client';
import { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useSessionStore } from '@/hooks/useSession';
import { useAttendance } from '@/hooks/useAttendance';
import { useRealtimeDocument } from '@/hooks/useRealtimeDocument';
import type { AttendanceRecord } from '@/types/attendance';
import Link from 'next/link';

const quickLinks = [
  { href: '/session/intro', label: '자기소개', icon: '👋', desc: '나를 소개해요' },
  { href: '/session/team', label: '우리 팀', icon: '👥', desc: '팀 구성 확인' },
  { href: '/session/board', label: '게시판', icon: '📋', desc: '의견을 나눠요' },
  { href: '/session/review', label: '강의후기', icon: '✍️', desc: '후기를 남겨요' },
];

export default function LearnerHomePage() {
  const { courseId, sessionId, participantId, participantName, sessionData } = useSessionStore();
  const { attendeeCount } = useAttendance();
  const [checking, setChecking] = useState(false);

  const { data: myAttendance } = useRealtimeDocument<AttendanceRecord>(
    courseId && sessionId && participantId
      ? `courses/${courseId}/sessions/${sessionId}/attendance/${participantId}`
      : '',
    !!(courseId && sessionId && participantId)
  );

  const handleCheckIn = async () => {
    if (!courseId || !sessionId || !participantId) return;
    setChecking(true);
    try {
      await setDoc(
        doc(db, `courses/${courseId}/sessions/${sessionId}/attendance`, participantId),
        { participantName, checkedInAt: serverTimestamp(), method: 'code' as const }
      );
    } catch (err) {
      console.error(err);
    }
    setChecking(false);
  };

  const isAttendanceOpen = sessionData?.settings?.attendanceOpen;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <h2 className="text-lg font-bold mb-1">출석 체크</h2>
          <p className="text-indigo-100 text-sm">현재 {attendeeCount}명 출석</p>
        </div>
        <div className="p-6">
          {myAttendance ? (
            <div className="text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="font-semibold text-green-600">출석 완료!</p>
            </div>
          ) : isAttendanceOpen ? (
            <button
              onClick={handleCheckIn}
              disabled={checking}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-lg transition"
            >
              {checking ? '체크 중...' : '출석하기'}
            </button>
          ) : (
            <p className="text-center text-slate-400">출석이 아직 열리지 않았습니다</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:border-indigo-300 transition"
          >
            <div className="text-2xl mb-2">{link.icon}</div>
            <h3 className="font-semibold text-slate-900 text-sm">{link.label}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
