'use client';
import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { useSessionStore } from '@/hooks/useSession';
import { usePosts } from '@/hooks/usePosts';
import { useTeams } from '@/hooks/useTeams';
import PostBoard from '@/components/board/PostBoard';
import CommentPanel from '@/components/board/CommentPanel';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { SkeletonList } from '@/components/ui/skeleton';
import EmptyState from '@/components/ui/empty-state';
import { toast } from '@/components/ui/toast';

export default function FacilitatorBoardPage() {
  const { courseId, sessionId, sessionData } = useSessionStore();
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const { posts, loading } = usePosts(sortBy);
  const { teams } = useTeams();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '';

  const toggleBoard = async () => {
    if (!basePath) return;
    try {
      const sessionRef = doc(db, basePath);
      await updateDoc(sessionRef, { 'settings.boardOpen': !sessionData?.settings?.boardOpen });
    } catch (err) {
      console.error(err);
      toast.error('게시판 상태 변경에 실패했습니다');
    }
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
        <PostBoard
          posts={posts}
          teams={teams}
          onOpenComments={(postId) => setSelectedPostId(postId)}
          showViewToggle
          dark
        />
      )}

      <CommentPanel
        postId={selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </div>
  );
}
