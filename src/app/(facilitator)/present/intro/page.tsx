'use client';
import { useSessionStore } from '@/hooks/useSession';
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';
import type { IntroCard } from '@/types/intro';
import Masonry from 'react-masonry-css';

export default function FacilitatorIntroPage() {
  const { courseId, sessionId } = useSessionStore();
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}/introCards` : '';
  const { data: intros, loading } = useRealtimeCollection<IntroCard>(basePath, [], !!basePath);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">자기소개</h1>
        <p className="text-slate-400 mt-1">{intros.length}명이 자기소개를 등록했습니다</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">로딩 중...</div>
      ) : intros.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">👋</div>
          <p className="text-slate-500 text-lg">아직 자기소개가 없습니다</p>
          <p className="text-slate-600 text-sm mt-1">학습자들이 자기소개를 작성하면 실시간으로 표시됩니다</p>
        </div>
      ) : (
        <Masonry
          breakpointCols={{ default: 4, 1280: 3, 1024: 2, 768: 1 }}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {intros.map((intro) => (
            <div key={intro.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700 mb-4 animate-fade-in hover:border-indigo-500/50 transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-lg font-bold text-indigo-300">
                  {intro.participantName[0]}
                </div>
                <span className="font-semibold text-slate-200">{intro.participantName}</span>
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{intro.content}</p>
              {intro.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {intro.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Masonry>
      )}
    </div>
  );
}
