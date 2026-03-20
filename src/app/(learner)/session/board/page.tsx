'use client';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { MessageSquare } from 'lucide-react';
import { useSessionStore } from '@/hooks/useSession';
import { usePosts } from '@/hooks/usePosts';
import PostCard from '@/components/board/PostCard';
import Tabs from '@/components/ui/tabs';
import { SkeletonList } from '@/components/ui/skeleton';
import EmptyState from '@/components/ui/empty-state';
import Masonry from 'react-masonry-css';

const SORT_TABS = [
  { id: 'newest', label: '최신순' },
  { id: 'popular', label: '인기순' },
];

export default function BoardPage() {
  const { courseId, sessionId, participantId, participantName } = useSessionStore();
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const { posts, loading } = usePosts(sortBy);
  const [content, setContent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [posting, setPosting] = useState(false);

  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}/posts` : '';

  const handlePost = async () => {
    if (!basePath || !content.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, basePath), {
        authorId: participantId,
        authorName: participantName,
        teamId: null,
        content: content.trim(),
        imageUrl: null,
        category: null,
        likeCount: 0,
        likedBy: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setContent('');
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
    setPosting(false);
  };

  const handleLike = async (postId: string) => {
    if (!basePath) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const postRef = doc(db, basePath, postId);
    const isLiked = post.likedBy?.includes(participantId);
    try {
      await updateDoc(postRef, {
        likedBy: isLiked ? arrayRemove(participantId) : arrayUnion(participantId),
        likeCount: increment(isLiked ? -1 : 1),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">게시판</h2>
        <Tabs
          tabs={SORT_TABS}
          activeTab={sortBy}
          onTabChange={(id) => setSortBy(id as 'newest' | 'popular')}
        />
      </div>

      {showForm ? (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200 animate-slide-up">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="의견을 자유롭게 남겨주세요..."
            rows={3}
            autoFocus
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none transition resize-none text-sm"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handlePost}
              disabled={posting || !content.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg transition"
            >
              {posting ? '등록 중...' : '등록'}
            </button>
            <button
              onClick={() => { setShowForm(false); setContent(''); }}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm transition"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl text-slate-400 hover:text-blue-500 text-sm font-medium transition"
        >
          + 새 글 작성하기
        </button>
      )}

      {loading ? (
        <SkeletonList count={3} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="아직 게시글이 없습니다"
          description="첫 번째 글을 작성해보세요!"
        />
      ) : (
        <Masonry
          breakpointCols={{ default: 2, 480: 1 }}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {posts.map((post) => (
            <div key={post.id} className="mb-3">
              <PostCard
                post={post}
                currentUserId={participantId}
                onToggleLike={handleLike}
              />
            </div>
          ))}
        </Masonry>
      )}
    </div>
  );
}
