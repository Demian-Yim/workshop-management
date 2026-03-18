'use client';

interface LikeButtonProps {
  count: number;
  isLiked: boolean;
  onClick?: () => void;
  dark?: boolean;
}

export default function LikeButton({ count, isLiked, onClick, dark }: LikeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        isLiked
          ? 'text-red-500 font-semibold'
          : dark
          ? 'text-slate-400 hover:text-red-400'
          : 'text-slate-400 hover:text-red-500'
      }`}
    >
      <span>{isLiked ? '❤️' : '🤍'}</span>
      <span>{count > 0 ? count : ''}</span>
    </button>
  );
}
