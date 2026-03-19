'use client';
import { useState } from 'react';
import { ClipboardList, Heart } from 'lucide-react';
import { useSessionStore } from '@/hooks/useSession';
import { usePosts } from '@/hooks/usePosts';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { SkeletonList } from '@/components/ui/skeleton';
import EmptyState from '@/components/ui/empty-state';
import Masonry from 'react-masonry-css';

export default function FacilitatorBoardPage() {
  const { courseId, sessionId, sessionData } = useSessionStore();
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const { posts, loading } = usePosts(sortBy);
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '';

  const toggleBoard = async () => {
    if (!basePath) return;
    const sessionRef = doc(db, basePath);
    await updateDoc(sessionRef, { 'settings.boardOpen': !sessionData?.settings?.boardOpen });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">게시판</h1>
          <p className="text-slate-400 mt-1">{posts.length}개의 게시글</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-slate-800 rounded-lg p-0.5">
            <button onClick={() => setSortBy('newest')} className={`px-3 py-1 text-xs rounded-md transition ${sortBy === 'newest' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>최신순</button>
            <button onClick={() => setSortBy('popular')} className={`px-3 py-1 text-xs rounded-md transition ${sortBy === 'popular' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>인기순</button>
          </div>
          <button
            onClick={toggleBoard}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              sessionData?.settings?.boardOpen
                ? 'bg-red-500/20 text-red-300'
                : 'bg-green-500/20 text-green-300'
            }`}
          >
            {sessionData?.settings?.boardOpen ? '게시판 닫기' : '게시판 열기'}
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonList count={4} dark />
      ) : posts.length === 0 ? (
        <EmptyState icon={ClipboardList} title="아직 게시글이 없습니다" dark />
      ) : (
        <Masonry
          breakpointCols={{ default: 4, 1280: 3, 1024: 2 }}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {posts.map((post) => (
            <div key={post.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700 mb-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-sm font-bold text-indigo-300">
                  {post.authorName[0]}
                </div>
                <span className="text-sm font-medium text-slate-300">{post.authorName}</span>
              </div>
              <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{post.content}</p>
              <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-400" />{post.likeCount || 0}</span>
              </div>
            </div>
          ))}
        </Masonry>
      )}
    </div>
  );
}
