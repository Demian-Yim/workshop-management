'use client';
import Masonry from 'react-masonry-css';
import { LayoutGrid, Columns3 } from 'lucide-react';
import { useState } from 'react';
import PostCard from './PostCard';
import TeamColumnBoard from './TeamColumnBoard';
import type { Post } from '@/types/board';

interface Team {
  id: string;
  name: string;
  color?: string | null;
}

interface PostBoardProps {
  posts: Post[];
  teams?: Team[];
  currentUserId?: string;
  onToggleLike?: (postId: string) => void;
  onOpenComments?: (postId: string) => void;
  dark?: boolean;
  columns?: number;
  defaultView?: 'masonry' | 'column';
  showViewToggle?: boolean;
}

const defaultBreakpoints = { default: 3, 1100: 2, 700: 1 };

export default function PostBoard({
  posts,
  teams,
  currentUserId,
  onToggleLike,
  onOpenComments,
  dark,
  columns,
  defaultView = 'masonry',
  showViewToggle = false,
}: PostBoardProps) {
  const [view, setView] = useState<'masonry' | 'column'>(defaultView);

  const breakpoints = columns
    ? { default: columns, 700: Math.min(columns, 2), 500: 1 }
    : defaultBreakpoints;

  if (posts.length === 0) {
    return (
      <div className={`text-center py-12 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        아직 게시글이 없습니다
      </div>
    );
  }

  return (
    <div>
      {showViewToggle && teams && teams.length > 0 && (
        <div className="flex justify-end mb-3">
          <div className={`flex rounded-lg border p-0.5 ${dark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
            <button
              type="button"
              onClick={() => setView('masonry')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'masonry'
                  ? dark ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-900'
                  : dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              타일
            </button>
            <button
              type="button"
              onClick={() => setView('column')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'column'
                  ? dark ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-900'
                  : dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Columns3 className="h-3.5 w-3.5" />
              팀별
            </button>
          </div>
        </div>
      )}

      {view === 'column' && teams && teams.length > 0 ? (
        <TeamColumnBoard
          posts={posts}
          teams={teams}
          currentUserId={currentUserId}
          onToggleLike={onToggleLike}
          onOpenComments={onOpenComments}
          dark={dark}
        />
      ) : (
        <Masonry
          breakpointCols={breakpoints}
          className="masonry-grid"
          columnClassName="masonry-grid-column"
        >
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onToggleLike={onToggleLike}
              onOpenComments={onOpenComments}
              dark={dark}
            />
          ))}
        </Masonry>
      )}
    </div>
  );
}
