'use client';
import { useMemo } from 'react';
import { orderBy } from 'firebase/firestore';
import { useSessionStore } from '@/hooks/useSession';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import type { Announcement } from '@/types/announcement';

export default function AnnouncementsPage() {
  const { courseId, sessionId } = useSessionStore();
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}/announcements` : '';
  const constraints = useMemo(() => [orderBy('createdAt', 'desc')], []);
  const { data: announcements, loading } = useRealtimeCollection<Announcement>(basePath, constraints, !!basePath);

  if (loading) return <div className="text-center py-12 text-slate-400">로딩 중...</div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-lg font-bold text-slate-900">📢 공지사항</h2>
      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📢</div>
          <p className="text-slate-500">아직 공지사항이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`bg-white rounded-xl p-4 shadow-sm border animate-fade-in ${
                ann.priority === 'urgent' ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {ann.priority === 'urgent' && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">긴급</span>
                )}
                <h3 className="font-semibold text-slate-900">{ann.title}</h3>
              </div>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{ann.content}</p>
              <p className="text-xs text-slate-400 mt-2">{ann.authorName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
