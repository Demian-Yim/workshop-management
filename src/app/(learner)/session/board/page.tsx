'use client';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useSessionStore } from '@/hooks/useSession';
import { usePosts } from '@/hooks/usePosts';
import type { Post } from '@/types/board';
import Masonry from 'react-masonry-css';

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

  const handleLike = async (post: Post) => {
    if (!basePath) return;
    const postRef = doc(db, basePath, post.id);
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
        <h2 className="text-lg font-bold text-slate-900">📋 게시판</h2>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setSortBy('newest')}
            className={`px-3 py-1 text-xs rounded-md transition ${sortBy === 'newest' ? 'bg-white shadow text-slate-900 font-semibold' : 'text-slate-500'}`}
          >최신순</button>
          <button
            onClick={() => setSortBy('popular')}
            className={`px-3 py-1 text-xs rounded-md transition ${sortBy === 'popular' ? 'bg-white shadow text-slate-900 font-semibold' : 'text-slate-500'}`}
          >인기순</button>
        </div>
      </div>

      {showForm ? (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-200 animate-slide-up">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="의견을 자유롭게 남겨주세요..."
            rows={3}
            autoFocus
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none transition resize-none text-sm"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handlePost}
              disabled={posting || !content.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg transition"
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
          className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl text-slate-400 hover:text-indigo-500 text-sm font-medium transition"
        >
          + 새 글 작성하기
        </button>
      )}

      {loading ? (
        <div className="text-center py-8 text-slate-400">로딩 중...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <div className="text-3xl mb-2">📝</div>
          <p className="text-sm">아직 게시글이 없습니다</p>
        </div>
      ) : (
        <Masonry
          breakpointCols={{ default: 2, 480: 1 }}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {posts.map((post) => {
            const isLiked = post.likedBy?.includes(participantId);
            return (
              <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-3 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                    {post.authorName[0]}
                  </div>
                  <span className="text-xs font-medium text-slate-700">{post.authorName}</span>
                  {post.authorId === participantId && (
                    <span className="text-xs text-indigo-500">(나)</span>
                  )}
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap mb-3">{post.content}</p>
                <button
                  onClick={() => handleLike(post)}
                  className={`flex items-center gap-1 text-xs transition ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
                >
                  <span>{isLiked ? '❤️' : '🤍'}</span>
                  <span>{post.likeCount || 0}</span>
                </button>
              </div>
            );
          })}
        </Masonry>
      )}
    </div>
  );
}
