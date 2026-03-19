'use client';

import CheckInFlow from '@/components/attendance/CheckInFlow';

export default function LearnerAttendancePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">출석 체크인</h1>
        <p className="text-sm text-slate-500 mt-1">
          출석 확인 후 셀카, 캐릭터 생성, 자기소개까지 한 번에 진행됩니다
        </p>
      </div>
      <CheckInFlow />
    </div>
  );
}
