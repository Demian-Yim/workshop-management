'use client';
import Masonry from 'react-masonry-css';
import PostCard from './PostCard';
import type { Post } from '@/types/board';

interface PostBoardProps {
  posts: Post[];
  currentUserId?: string;
  onToggleLike?: (postId: string) => void;
  dark?: boolean;
  columns?: number;
}

const defaultBreakpoints = { default: 3, 1100: 2, 700: 1 };

export default function PostBoard({ posts, currentUserId, onToggleLike, dark, columns }: PostBoardProps) {
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
          dark={dark}
        />
      ))}
    </Masonry>
  );
}
