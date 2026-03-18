'use client';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import type { Course } from '@/types/session';

export default function FacilitatorsPage() {
  const { data: courses } = useRealtimeCollection<Course>('courses', [], true);

  const facilitators = Array.from(
    new Map(
      courses
        .filter((c) => c.facilitatorName)
        .map((c) => [c.facilitatorName, { name: c.facilitatorName, id: c.facilitatorId, courses: 0 }])
    ).values()
  );

  facilitators.forEach((f) => {
    f.courses = courses.filter((c) => c.facilitatorName === f.name).length;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">강사 관리</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {facilitators.length === 0 ? (
          <div className="p-8 text-center text-slate-400">등록된 강사가 없습니다</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {facilitators.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                    {f.name[0]}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{f.name}</h3>
                    <p className="text-sm text-slate-500">{f.courses}개 교육과정</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
