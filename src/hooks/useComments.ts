'use client';

import { useCallback, useMemo, useState } from 'react';
import { orderBy } from 'firebase/firestore';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useSessionStore } from './useSession';
import { addDocument, updateDocument, increment } from '@/lib/firebase/firestore';
import type { Comment } from '@/types/board';

export function useComments(postId: string | null) {
  const { courseId, sessionId } = useSessionStore();
  const [submitting, setSubmitting] = useState(false);

  const path =
    courseId && sessionId && postId
      ? `courses/${courseId}/sessions/${sessionId}/posts/${postId}/comments`
      : '';

  const constraints = useMemo(() => [orderBy('createdAt', 'asc')], []);

  const { data: comments, loading, error } = useRealtimeCollection<Comment>(
    path,
    constraints,
    !!path,
    50
  );

  const addComment = useCallback(
    async (content: string, authorId: string, authorName: string) => {
      if (!path || !postId || !courseId || !sessionId || submitting) return;
      setSubmitting(true);
      try {
        await addDocument(path, { content, authorId, authorName, postId });
        const postPath = `courses/${courseId}/sessions/${sessionId}/posts/${postId}`;
        await updateDocument(postPath, { commentCount: increment(1) });
      } finally {
        setSubmitting(false);
      }
    },
    [path, postId, courseId, sessionId, submitting]
  );

  return { comments, loading, error, addComment, submitting };
}
