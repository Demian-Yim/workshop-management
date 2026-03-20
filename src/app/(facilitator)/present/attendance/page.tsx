'use client';
import { useEffect, useState } from 'react';
import { useSessionStore } from '@/hooks/useSession';
import { useAttendance } from '@/hooks/useAttendance';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Participant } from '@/types/session';
import QRCode from 'qrcode';

export default function FacilitatorAttendancePage() {
  const { courseId, sessionId, sessionCode, sessionData } = useSessionStore();
  const { attendees, attendeeCount } = useAttendance();
  const [qrUrl, setQrUrl] = useState('');

  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '';
  const { data: participants } = useRealtimeCollection<Participant>(
    basePath ? `${basePath}/participants` : '', [], !!basePath
  );

  useEffect(() => {
    const joinUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/join?code=${sessionCode}`
      : '';
    if (joinUrl) {
      QRCode.toDataURL(joinUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#1E293B', light: '#FFFFFF' },
      }).then(setQrUrl);
    }
  }, [sessionCode]);

  const toggleAttendance = async () => {
    if (!basePath) return;
    const sessionRef = doc(db, basePath);
    const currentOpen = sessionData?.settings?.attendanceOpen ?? false;
    await updateDoc(sessionRef, { 'settings.attendanceOpen': !currentOpen });
  };

  const isOpen = sessionData?.settings?.attendanceOpen;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">출석 관리</h1>
          <p className="text-slate-400 mt-1">{attendeeCount} / {participants.length}명 출석</p>
        </div>
        <button
          onClick={toggleAttendance}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            isOpen
              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
              : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
          }`}
        >
          {isOpen ? '출석 마감' : '출석 시작'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code */}
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">QR 코드로 참여</h2>
          {qrUrl && (
            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <img src={qrUrl} alt="QR Code" className="w-64 h-64" />
            </div>
          )}
          <div className="text-6xl font-mono font-bold text-blue-400 tracking-[0.3em]">
            {sessionCode}
          </div>
          <p className="text-sm text-slate-500 mt-2">이 코드를 학습자에게 알려주세요</p>
        </div>

        {/* Attendance List */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">
            출석 현황
            <span className="ml-2 text-sm text-slate-400">({attendeeCount}명)</span>
          </h2>
          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-3 mb-6">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${participants.length > 0 ? (attendeeCount / participants.length) * 100 : 0}%` }}
            />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {attendees.length === 0 ? (
              <p className="text-slate-500 text-center py-8">아직 출석한 학습자가 없습니다</p>
            ) : (
              attendees.map((a, i) => (
                <div key={a.id} className="flex items-center gap-3 bg-slate-700/50 rounded-lg px-4 py-2 animate-fade-in">
                  <span className="text-xs font-medium text-slate-500 w-6">{i + 1}</span>
                  {a.selfieUrl || a.characterUrl ? (
                    <div className="flex gap-1 flex-shrink-0">
                      {a.selfieUrl && (
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-600">
                          <img src={a.selfieUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {a.characterUrl && (
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-600">
                          <img src={a.characterUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-sm text-green-300">
                      ✓
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-200">{a.participantName}</span>
                  <span className="text-xs text-slate-500 ml-auto">{a.method}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
