'use client';
import Image from 'next/image';
import { MessageCircle, Pin } from 'lucide-react';
import Avatar from '@/components/ui/avatar';
import LikeButton from './LikeButton';
import type { Post } from '@/types/board';
import { formatDateTime } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onToggleLike?: (postId: string) => void;
  onOpenComments?: (postId: string) => void;
  dark?: boolean;
}

export default function PostCard({ post, currentUserId, onToggleLike, onOpenComments, dark }: PostCardProps) {
  const isLiked = currentUserId ? post.likedBy?.includes(currentUserId) ?? false : false;

  const cardStyle = post.color && !dark
    ? { backgroundColor: post.color }
    : undefined;

  const baseClass = dark
    ? 'bg-slate-800'
    : post.color
      ? 'border border-black/5 shadow-sm'
      : 'bg-white border border-slate-200 shadow-sm';

  return (
    <div
      className={`relative rounded-xl p-4 ${baseClass}`}
      style={cardStyle}
    >
      {post.pinned && (
        <span className="absolute top-3 right-3 text-slate-400">
          <Pin className="h-3.5 w-3.5 fill-current" />
        </span>
      )}

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
        <Image
          src={post.imageUrl}
          alt="게시글 이미지"
          width={600}
          height={400}
          className="rounded-lg w-full mb-3 object-cover max-h-64"
          unoptimized
        />
      )}

      <div className="flex items-center gap-3">
        <LikeButton
          count={post.likeCount}
          isLiked={isLiked}
          onClick={() => onToggleLike?.(post.id)}
          dark={dark}
        />
        {onOpenComments && (
          <button
            type="button"
            onClick={() => onOpenComments(post.id)}
            className={`flex items-center gap-1 text-xs ${dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'} transition-colors`}
          >
            <MessageCircle className="h-4 w-4" />
            {post.commentCount > 0 && <span>{post.commentCount}</span>}
          </button>
        )}
      </div>
    </div>
  );
}
