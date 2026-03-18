'use client';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import type { Course } from '@/types/session';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function CoursesPage() {
  const { data: courses, loading } = useRealtimeCollection<Course>('courses', [], true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [facilitatorName, setFacilitatorName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !facilitatorName.trim()) return;
    setCreating(true);
    try {
      await addDoc(collection(db, 'courses'), {
        title: title.trim(),
        description: '',
        startDate: Timestamp.now(),
        endDate: Timestamp.now(),
        facilitatorId: '',
        facilitatorName: facilitatorName.trim(),
        status: 'active',
        createdAt: serverTimestamp(),
        createdBy: 'admin',
      });
      setTitle('');
      setFacilitatorName('');
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
    setCreating(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">교육과정 관리</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition text-sm"
        >
          + 교육과정 등록
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-200 mb-6 animate-slide-up">
          <h2 className="font-semibold text-slate-900 mb-4">새 교육과정</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="교육과정명"
              className="px-4 py-2 border border-slate-200 rounded-lg focus:border-purple-500 outline-none"
            />
            <input
              type="text"
              value={facilitatorName}
              onChange={(e) => setFacilitatorName(e.target.value)}
              placeholder="담당 강사명"
              className="px-4 py-2 border border-slate-200 rounded-lg focus:border-purple-500 outline-none"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium"
            >{creating ? '등록 중...' : '등록'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500 text-sm">취소</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-slate-400">로딩 중...</div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-center text-slate-400">등록된 교육과정이 없습니다</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/courses/${course.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition"
              >
                <div>
                  <h3 className="font-medium text-slate-900">{course.title}</h3>
                  <p className="text-sm text-slate-500">
                    {course.facilitatorName} 강사 | {formatDate(course.startDate)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  course.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
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
