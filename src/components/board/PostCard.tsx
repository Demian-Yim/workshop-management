'use client';
import Avatar from '@/components/ui/avatar';
import LikeButton from './LikeButton';
import type { Post } from '@/types/board';
import { formatDateTime } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onToggleLike?: (postId: string) => void;
  dark?: boolean;
}

export default function PostCard({ post, currentUserId, onToggleLike, dark }: PostCardProps) {
  const isLiked = currentUserId ? post.likedBy.includes(currentUserId) : false;

  return (
    <div className={`rounded-xl p-4 ${dark ? 'bg-slate-800' : 'bg-white border border-slate-200 shadow-sm'}`}>
      <div className="flex items-center gap-2 mb-3">
        <Avatar name={post.authorName} size="sm" />
        <div>
          <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
            {post.authorName}
          </p>
          {post.createdAt && (
            <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              {formatDateTime(post.createdAt)}
            </p>
          )}
        </div>
      </div>
      <p className={`text-sm leading-relaxed mb-3 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
        {post.content}
      </p>
      {post.imageUrl && (
        <img src={post.imageUrl} alt="게시글 이미지" className="rounded-lg w-full mb-3 object-cover max-h-64" />
      )}
      <LikeButton
        count={post.likeCount}
        isLiked={isLiked}
        onClick={() => onToggleLike?.(post.id)}
        dark={dark}
      />
    </div>
  );
}
