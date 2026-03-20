'use client';
import { useState } from 'react';
import { Hand, Users, ClipboardList, PenLine, CheckCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useSessionStore } from '@/hooks/useSession';
import { useAttendance } from '@/hooks/useAttendance';
import { useRealtimeDocument } from '@/hooks/useRealtimeDocument';
import Button from '@/components/ui/button';
import type { AttendanceRecord } from '@/types/attendance';
import Link from 'next/link';

const quickLinks: { href: string; label: string; icon: LucideIcon; desc: string }[] = [
  { href: '/session/intro', label: '자기소개', icon: Hand, desc: '나를 소개해요' },
  { href: '/session/team', label: '우리 팀', icon: Users, desc: '팀 구성 확인' },
  { href: '/session/board', label: '게시판', icon: ClipboardList, desc: '의견을 나눠요' },
  { href: '/session/review', label: '강의후기', icon: PenLine, desc: '후기를 남겨요' },
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <h2 className="text-lg font-bold mb-1">출석 체크</h2>
          <p className="text-blue-100 text-sm">현재 {attendeeCount}명 출석</p>
        </div>
        <div className="p-6">
          {myAttendance ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2 animate-scale-in">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <p className="font-semibold text-green-600">출석 완료!</p>
            </div>
          ) : isAttendanceOpen ? (
            <Button
              onClick={handleCheckIn}
              disabled={checking}
              loading={checking}
              size="lg"
              className="w-full"
            >
              출석하기
            </Button>
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
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:border-blue-300 transition"
          >
            <div className="mb-2"><link.icon className="w-6 h-6 text-blue-500" /></div>
            <h3 className="font-semibold text-slate-900 text-sm">{link.label}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
