'use client';

import { useMemo } from 'react';
import { orderBy, where } from 'firebase/firestore';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useSessionStore } from './useSession';
import type { Post, BoardSection } from '@/types/board';

export function usePosts(sortBy: 'newest' | 'popular' = 'newest', sectionId?: string | null) {
  const { courseId, sessionId } = useSessionStore();

  const path =
    courseId && sessionId
      ? `courses/${courseId}/sessions/${sessionId}/posts`
      : '';

  const constraints = useMemo(() => {
    const base = sortBy === 'popular'
      ? [orderBy('likeCount', 'desc')]
      : [orderBy('createdAt', 'desc')];
    if (sectionId) return [where('sectionId', '==', sectionId), ...base];
    return base;
  }, [sortBy, sectionId]);

  const { data, loading, error } = useRealtimeCollection<Post>(
    path,
    constraints,
    !!path,
    100
  );

  return { posts: data, loading, error };
}

export function useBoardSections() {
  const { courseId, sessionId } = useSessionStore();

  const path =
    courseId && sessionId
      ? `courses/${courseId}/sessions/${sessionId}/boardSections`
      : '';

  const constraints = useMemo(() => [orderBy('orderIndex', 'asc')], []);

  const { data, loading, error } = useRealtimeCollection<BoardSection>(
    path,
    constraints,
    !!path
  );

  return { sections: data, loading, error };
}
