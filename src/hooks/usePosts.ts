'use client';

import { useMemo } from 'react';
import { orderBy } from 'firebase/firestore';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useSessionStore } from './useSession';
import type { Post } from '@/types/board';

export function usePosts(sortBy: 'newest' | 'popular' = 'newest') {
  const { courseId, sessionId } = useSessionStore();

  const path =
    courseId && sessionId
      ? `courses/${courseId}/sessions/${sessionId}/posts`
      : '';

  const constraints = useMemo(
    () =>
      sortBy === 'popular'
        ? [orderBy('likeCount', 'desc')]
        : [orderBy('createdAt', 'desc')],
    [sortBy]
  );

  const { data, loading, error } = useRealtimeCollection<Post>(
    path,
    constraints,
    !!path,
    100
  );

  return { posts: data, loading, error };
}
