'use client';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import type { Course } from '@/types/session';

export default function ReportsPage() {
  const { data: courses } = useRealtimeCollection<Course>('courses', [], true);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">리포트</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="font-semibold text-slate-900 mb-4">교육과정 현황</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">전체 교육과정</span>
              <span className="font-medium">{courses.length}개</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">진행 중</span>
              <span className="font-medium text-emerald-600">{courses.filter((c) => c.status === 'active').length}개</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">완료</span>
              <span className="font-medium text-slate-400">{courses.filter((c) => c.status === 'completed').length}개</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="font-semibold text-slate-900 mb-4">데이터 내보내기</h2>
          <p className="text-sm text-slate-500 mb-4">교육과정별 데이터를 CSV로 내보낼 수 있습니다</p>
          <div className="space-y-2">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">{course.title}</span>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">CSV 내보내기</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
