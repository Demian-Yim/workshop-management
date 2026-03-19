'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  dark?: boolean;
}

export function Skeleton({ className, dark }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg animate-shimmer',
        dark
          ? 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700'
          : 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200',
        className
      )}
    />
  );
}

interface SkeletonCardProps {
  dark?: boolean;
}

export function SkeletonCard({ dark }: SkeletonCardProps) {
  return (
    <div className={cn(
      'rounded-2xl shadow-sm border p-4 space-y-3',
      dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    )}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" dark={dark} />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" dark={dark} />
          <Skeleton className="h-3 w-16" dark={dark} />
        </div>
      </div>
      <Skeleton className="h-4 w-full" dark={dark} />
      <Skeleton className="h-4 w-3/4" dark={dark} />
    </div>
  );
}

interface SkeletonListProps {
  count?: number;
  dark?: boolean;
}

export function SkeletonList({ count = 3, dark }: SkeletonListProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} dark={dark} />
      ))}
    </div>
  );
}
