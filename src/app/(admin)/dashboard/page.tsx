'use client';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import type { Course } from '@/types/session';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { data: courses, loading } = useRealtimeCollection<Course>('courses', [], true);

  const activeCourses = courses.filter((c) => c.status === 'active');
  const completedCourses = courses.filter((c) => c.status === 'completed');

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">전체 교육과정</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{courses.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">진행 중</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{activeCourses.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">완료</p>
          <p className="text-3xl font-bold text-slate-400 mt-1">{completedCourses.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">최근 교육과정</h2>
          <Link href="/dashboard/courses" className="text-sm text-purple-600 hover:text-purple-700">전체 보기</Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">로딩 중...</div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-center text-slate-400">등록된 교육과정이 없습니다</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {courses.slice(0, 5).map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/courses/${course.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition"
              >
                <div>
                  <h3 className="font-medium text-slate-900">{course.title}</h3>
                  <p className="text-sm text-slate-500">{course.facilitatorName} 강사</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  course.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                  course.status === 'completed' ? 'bg-slate-100 text-slate-500' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {course.status === 'active' ? '진행 중' : course.status === 'completed' ? '완료' : '준비 중'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
